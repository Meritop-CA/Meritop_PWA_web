export const environment = {
  production: true,
  // Ruta relativa: el API se llama en el mismo dominio o IP con que se abrió la PWA
  // (https://xtracashformqa.meritop.com/api o http://172.30.146.98/api), sin fijar ninguno.
  // También evita el bloqueo por contenido mixto cuando la página se abre por https.
  apiUrl: '/api'
};
