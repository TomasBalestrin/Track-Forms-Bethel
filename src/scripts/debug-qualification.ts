import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debug() {
  // 1. Listar todos os pixels
  const { data: pixels } = await supabase.from('pixels').select('id, name')
  console.log('\n=== PIXELS ===')
  console.log(pixels)

  for (const pixel of pixels || []) {
    console.log(`\n=== PIXEL: ${pixel.name} (${pixel.id}) ===`)

    // 2. Regras ativas deste pixel
    const { data: rules } = await supabase
      .from('qualification_rules')
      .select('*')
      .eq('pixel_id', pixel.id)
    console.log('\nRegras no banco:')
    rules?.forEach(r => {
      console.log(`  ${r.field_name} | is_active: ${r.is_active} (${typeof r.is_active}) | values: ${JSON.stringify(r.qualified_values)}`)
    })

    // 3. Leads que estão qualified=true
    const { data: qualifiedLeads } = await supabase
      .from('lead_submissions')
      .select('id, email, is_qualified, fb_sent_at, form_data')
      .eq('pixel_id', pixel.id)
      .eq('is_qualified', true)
      .order('created_at', { ascending: false })
      .limit(20)

    console.log(`\nLeads qualificados: ${qualifiedLeads?.length || 0}`)

    // 4. Re-testar cada lead qualificado contra as regras atuais
    const activeRules = (rules || []).filter(r => r.is_active === true)
    console.log(`Regras ativas: ${activeRules.length}`)

    for (const lead of qualifiedLeads || []) {
      const results = activeRules.map(rule => {
        const answer = lead.form_data?.[rule.field_name]
        const answerType = typeof answer
        const match = answerType === 'string'
          ? rule.qualified_values.some((v: string) => v.toLowerCase().trim() === answer.toLowerCase().trim())
          : false
        return { field: rule.field_name, answer, answerType, match }
      })

      const allPass = results.every(r => r.match)
      const falsePositive = !allPass && lead.is_qualified

      if (falsePositive) {
        console.log(`\n  ❌ FALSO POSITIVO: ${lead.email}`)
        console.log(`     fb_sent_at: ${lead.fb_sent_at}`)
        results.forEach(r => {
          console.log(`     ${r.field}: "${r.answer}" (${r.answerType}) → ${r.match ? '✅' : '❌'}`)
        })
      }
    }
  }
}

debug().catch(console.error)
