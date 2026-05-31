// Patches the n8n workflow to wire aspectRatio through Normalize Input → fal.ai → JsonCut
const https = require('https')
const http = require('http')

const N8N_BASE = 'https://primary-production-1e62e.up.railway.app'
const WORKFLOW_ID = process.argv[2] || '7wmYRLI6yvTS5kM3'
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNTk4NTFmZi01ODhkLTRkNTUtODAyZi1lZGUyMGQxNmMxZWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMDFiNzM1NzUtYmRhMi00OTI4LTk1MDQtMzdmYTA3MWFkOGViIiwiaWF0IjoxNzc5OTk1NTk1LCJleHAiOjE3ODI1MzI4MDB9.IWUEJQYMYFUOzqkV71OFZJsXQlwQURelw46McQarq2E'

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(N8N_BASE + path)
    const lib = url.protocol === 'https:' ? https : http
    const payload = body ? JSON.stringify(body) : undefined
    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      const chunks = []
      res.on('data', d => chunks.push(d))
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }))
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

async function main() {
  // Fetch workflow
  console.log('Fetching workflow...')
  const get = await request('GET', `/api/v1/workflows/${WORKFLOW_ID}`)
  if (get.status !== 200) throw new Error(`GET failed: ${get.status} ${get.body}`)
  const data = JSON.parse(get.body)
  const nodes = data.nodes

  // ── 1. Normalize Input: add aspectRatio mapping ──────────────────────────
  const normNode = nodes.find(n => n.name === 'Normalize Input')
  if (!normNode) throw new Error('Could not find Normalize Input node')
  const alreadyHas = normNode.parameters.assignments.assignments.find(a => a.name === 'aspectRatio')
  if (alreadyHas) {
    console.log('Normalize Input already has aspectRatio — updating value')
    alreadyHas.value = "={{ $input.first().json.body?.aspectRatio ?? $input.first().json.aspectRatio ?? '9:16' }}"
  } else {
    normNode.parameters.assignments.assignments.push({
      id: 'norm-aspectRatio',
      name: 'aspectRatio',
      value: "={{ $input.first().json.body?.aspectRatio ?? $input.first().json.aspectRatio ?? '9:16' }}",
      type: 'string',
    })
    console.log('Added aspectRatio to Normalize Input')
  }

  // ── 2. fal.ai Submit Clip: fix aspect_ratio name, expression syntax, and reference ──
  const falNode = nodes.find(n => n.name === 'fal.ai — Submit Clip')
  if (!falNode) throw new Error('Could not find fal.ai node')
  // Remove empty params and the broken =aspect_ratio entry, then re-add correctly
  falNode.parameters.bodyParameters.parameters = falNode.parameters.bodyParameters.parameters.filter(
    p => p.name && p.name !== 'aspect_ratio' && p.name !== '=aspect_ratio'
  )
  falNode.parameters.bodyParameters.parameters.push({
    name: 'aspect_ratio',
    value: "={{ $('Normalize Input').first().json.aspectRatio ?? '9:16' }}",
  })
  console.log('fal.ai aspect_ratio: fixed name (removed = prefix), fixed expression syntax, fixed reference to Normalize Input')

  // ── 3. JsonCut Render Final Video: make width/height dynamic ─────────────
  const jcNode = nodes.find(n => n.name === 'JsonCut — Render Final Video')
  if (!jcNode) throw new Error('Could not find JsonCut render node')
  jcNode.parameters.jsonBody =
    `={{ (() => { ` +
    `const ar = $('Normalize Input').first().json.aspectRatio ?? '9:16'; ` +
    `const width = ar === '16:9' ? 1920 : 1080; ` +
    `const height = ar === '16:9' ? 1080 : 1920; ` +
    `const d = $json.data.sort((a,b) => a.sceneIndex - b.sceneIndex); ` +
    `const clips = d.map(x => ({duration:5,layers:[{type:"video",path:x.videoUrl,resizeMode:"cover"}],transition:{name:"fade",duration:0.5} })); ` +
    `return JSON.stringify({type:"video",config:{width,height,fps:24,audioTracks:[{path:d[0].audioUrl,mixVolume:1.0,start:0}],defaults:{transition:{name:"fade",duration:0.5} },clips} }); ` +
    `})() }}`
  console.log('JsonCut width/height: hardcoded 1080×1920 → dynamic based on aspectRatio')

  // ── Also update webhook trigger notes to document aspectRatio ─────────────
  const webhookNode = nodes.find(n => n.type === 'n8n-nodes-base.webhook')
  if (webhookNode) {
    webhookNode.notes =
      'Entry point. Receives POST from Next.js when user clicks Generate Videos.\n\n' +
      'Expected payload:\n{\n' +
      '  campaignId: string,\n' +
      '  theme: string,\n' +
      '  voiceoverScript: string,\n' +
      '  scenes: [{ sceneIndex, label, prompt }],\n' +
      '  audioDurationEstimate: number,\n' +
      '  aspectRatio: string  // "16:9" for YouTube, "9:16" for all others\n' +
      '}'
    console.log('Updated webhook trigger notes to include aspectRatio')
  }

  // PATCH workflow — send only the fields n8n's PUT endpoint accepts
  // Strip binaryMode from settings — n8n's PUT schema rejects it
  const allowedSettings = ['executionOrder', 'saveDataErrorExecution', 'saveDataSuccessExecution',
    'saveManualExecutions', 'saveExecutionProgress', 'timezone', 'maxCompileTime']
  const cleanSettings = {}
  for (const k of allowedSettings) {
    if (data.settings?.[k] !== undefined) cleanSettings[k] = data.settings[k]
  }
  const payload = {
    name: data.name,
    nodes: data.nodes,
    connections: data.connections,
    settings: cleanSettings,
    staticData: data.staticData ?? null,
  }
  console.log('\nPatching workflow...')
  const patch = await request('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, payload)
  if (patch.status !== 200) {
    console.error('PATCH failed:', patch.status, patch.body.substring(0, 500))
    process.exit(1)
  }
  console.log('✓ Workflow patched successfully')

  // Verify
  const verify = JSON.parse(patch.body)
  const verifyNorm = verify.nodes.find(n => n.name === 'Normalize Input')
  const verifyAr = verifyNorm?.parameters.assignments.assignments.find(a => a.name === 'aspectRatio')
  console.log('\n=== VERIFICATION ===')
  console.log('Normalize Input aspectRatio assignment:', verifyAr ? '✓ present' : '✗ MISSING')
  const verifyFal = verify.nodes.find(n => n.name === 'fal.ai — Submit Clip')
  const verifyArParam = verifyFal?.parameters.bodyParameters.parameters.find(p => p.name === 'aspect_ratio')
  console.log('fal.ai aspect_ratio value:', verifyArParam?.value)
  const verifyJc = verify.nodes.find(n => n.name === 'JsonCut — Render Final Video')
  console.log('JsonCut jsonBody (first 120):', verifyJc?.parameters.jsonBody?.substring(0, 120))
}

main().catch(e => { console.error(e); process.exit(1) })
