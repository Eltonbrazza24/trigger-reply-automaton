
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extrai gatilhos da mensagem (palavras que começam com #)
    const triggerMatch = message.match(/#\w+/gi)
    
    if (!triggerMatch) {
      return new Response(
        JSON.stringify({ found: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verifica cada gatilho encontrado
    for (const trigger of triggerMatch) {
      const { data: triggerData, error } = await supabaseClient
        .from('triggers')
        .select('*')
        .eq('trigger_text', trigger.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar gatilho:', error)
        continue
      }

      if (triggerData) {
        // Incrementa contador de uso
        await supabaseClient
          .from('triggers')
          .update({ 
            usage_count: triggerData.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', triggerData.id)

        return new Response(
          JSON.stringify({
            found: true,
            response: triggerData.response_text,
            trigger: triggerData.trigger_text
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ found: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
