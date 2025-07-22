// Test script para verificar la configuración de Google OAuth
// Ejecutar con: node test-google-oauth.js

const https = require('https');
const http = require('http');

async function testGoogleOAuthStatus() {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/google/status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Verificando configuración de Google OAuth...\n');
  
  try {
    const status = await testGoogleOAuthStatus();
    
    console.log('📊 Estado de la configuración:');
    console.log('================================');
    console.log(`✅ Servidor: Disponible`);
    console.log(`🔧 Configurado: ${status.configured ? '✅ Sí' : '❌ No'}`);
    console.log(`🆔 Client ID: ${status.clientId}`);
    console.log(`🔐 Client Secret: ${status.hasSecret ? '✅ Configurado' : '❌ Faltante'}`);
    console.log(`📝 Mensaje: ${status.message}`);
    
    if (status.missingConfig && status.missingConfig.length > 0) {
      console.log(`\n❌ Configuración faltante:`);
      status.missingConfig.forEach(config => {
        console.log(`   - ${config}`);
      });
    }
    
    console.log('\n📋 Pasos siguientes:');
    if (!status.configured) {
      if (status.missingConfig?.includes('GOOGLE_CLIENT_SECRET')) {
        console.log('1. 🔑 Obtén el Client Secret desde Google Cloud Console');
        console.log('2. 📝 Actualiza la variable GOOGLE_CLIENT_SECRET en .env');
        console.log('3. 🔄 Reinicia el servidor');
        console.log('4. 🧪 Ejecuta este script nuevamente para verificar');
        console.log('\n📖 Ver: google-oauth-setup.md para instrucciones detalladas');
      }
    } else {
      console.log('1. ✅ La configuración está completa');
      console.log('2. 🌐 Prueba el login con Google en la aplicación');
      console.log('3. 🔗 URL: http://localhost:8080/login');
    }
    
  } catch (error) {
    console.log('❌ Error conectando al servidor:');
    console.log(`   ${error.message}`);
    console.log('\n🔧 Asegúrate de que el servidor esté ejecutándose:');
    console.log('   npm run dev');
  }
}

main();
