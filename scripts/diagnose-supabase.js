import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kroclpxgulgrezbxjhnt.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb2NscHhndWxncmV6YnhqaG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMTQzNDIsImV4cCI6MjA2Njc5MDM0Mn0.sJOItsqW89bKi-CZcx5Ml9fP0uEcqEDAB7sA6xXbBN8";

console.log('🔍 Iniciando diagnóstico de Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseSupabase() {
  try {
    console.log('\n📊 Probando conectividad básica...');
    
    // 1. Probar conectividad básica
    const { data: testData, error: testError } = await supabase
      .from('businesses')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conectividad:', testError);
      return;
    }
    
    console.log('✅ Conectividad OK');
    
    // 2. Probar consulta de negocios
    console.log('\n📊 Probando consulta de negocios...');
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id, business_name, email')
      .limit(5);
    
    if (businessesError) {
      console.error('❌ Error consultando negocios:', businessesError);
    } else {
      console.log('✅ Negocios encontrados:', businesses?.length || 0);
      if (businesses && businesses.length > 0) {
        console.log('Primer negocio:', businesses[0]);
      }
    }
    
    // 3. Probar consulta de promociones
    console.log('\n📊 Probando consulta de promociones...');
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('id, title, business_id')
      .limit(5);
    
    if (promotionsError) {
      console.error('❌ Error consultando promociones:', promotionsError);
    } else {
      console.log('✅ Promociones encontradas:', promotions?.length || 0);
      if (promotions && promotions.length > 0) {
        console.log('Primera promoción:', promotions[0]);
      }
    }
    
    // 4. Probar función RPC
    console.log('\n📊 Probando función RPC get_business_followers_count...');
    try {
      const { data: followersResult, error: followersError } = await supabase
        .rpc('get_business_followers_count', { business_uuid: 'test' });
      
      if (followersError) {
        console.error('❌ Error en función RPC:', followersError);
      } else {
        console.log('✅ Función RPC OK, resultado:', followersResult);
      }
    } catch (rpcError) {
      console.error('❌ Error ejecutando función RPC:', rpcError);
    }
    
    // 5. Probar consulta de seguidores
    console.log('\n📊 Probando consulta de seguidores...');
    const { data: followers, error: followersError } = await supabase
      .from('followed_businesses')
      .select('id, business_id, client_id')
      .limit(5);
    
    if (followersError) {
      console.error('❌ Error consultando seguidores:', followersError);
    } else {
      console.log('✅ Seguidores encontrados:', followers?.length || 0);
    }
    
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

diagnoseSupabase(); 