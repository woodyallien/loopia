import type { Campaign, Customer, Reward } from '../lib/types'

const firstNames=['Carlos','Lucía','Mateo','Sofía','Diego','Valentina','James','Emma','Lucas','Camila','Oliver','Chloé','Hans','Ana','Bruno','Martina','Kenji','Alice','Tomás','Mia']
const lastNames=['Quispe','Flores','Vargas','Mendoza','Rojas','Salazar','Smith','Brown','García','Dubois','Müller','Silva','González','Wilson','Sato','Taylor']
const countries=['Perú','Perú','Perú','Estados Unidos','Canadá','España','Francia','Alemania','Brasil','Argentina','Chile','Australia','Reino Unido','Japón']
const tiers:Customer['tier'][]=['Explorador','Viajero','Frecuente','Insider','VIP']
export const customers:Customer[]=Array.from({length:144},(_,i)=>{
  const visits=(i*7)%29+1, spend=visits*(38+(i%8)*9), points=(visits*137+i*23)%7200, days=(i*11)%75
  const name=`${firstNames[i%firstNames.length]} ${lastNames[(i*3)%lastNames.length]}`
  return { id:`CUS-${String(i+1).padStart(4,'0')}`, name, initials:name.split(' ').map(x=>x[0]).join(''), country:countries[(i*5)%countries.length], language:i%4===0?'EN':'ES', visits, spend, points, tier:tiers[Math.min(4,Math.floor(points/1500))], lastVisit:days===0?'Hoy':`Hace ${days} días`, referrals:(i*3)%9, status:days>50?'Inactivo':days>25?'En riesgo':'Activo', phone:`+51 9${String(44000000+i*137).slice(0,8)}`, email:`cliente${i+1}@example.com`, city:i%3?'Cusco':'Lima', joined:`${(i%28)+1} ago 2026` }
})
Object.assign(customers[0], { name:'Carlos Quispe', initials:'CQ', country:'Perú', language:'ES', visits:14, spend:1260, points:2820, tier:'Frecuente', lastVisit:'Hace 21 días', referrals:3, status:'Frecuente', email:'carlos.quispe@example.com' })
Object.assign(customers[1], { name:'Sofía Mendoza', initials:'SM', country:'Perú', language:'ES', visits:27, spend:4680, points:6420, tier:'VIP', lastVisit:'Hace 3 días', referrals:4, status:'VIP', email:'sofia.mendoza@example.com' })
Object.assign(customers[2], { name:'Mateo Vargas', initials:'MV', country:'Perú', language:'ES', visits:19, spend:2410, points:3910, tier:'Insider', lastVisit:'Hace 6 días', referrals:8, status:'Frecuente', email:'mateo.vargas@example.com' })
Object.assign(customers[3], { name:'Sarah Wilson', initials:'SW', country:'Estados Unidos', language:'EN', visits:1, spend:146, points:196, tier:'Explorador', lastVisit:'Hoy', referrals:0, status:'Nuevo', email:'sarah.wilson@example.com' })
Object.assign(customers[4], { name:'Lucía Flores', initials:'LF', country:'Perú', language:'ES', visits:8, spend:710, points:1470, tier:'Viajero', lastVisit:'Hace 4 días', referrals:2, status:'Frecuente', email:'lucia.flores@example.com' })
Object.assign(customers[5], { name:'James Smith', initials:'JS', country:'Canadá', language:'EN', visits:11, spend:1380, points:3240, tier:'Insider', lastVisit:'Hace 42 días', referrals:1, status:'En riesgo', email:'james.smith@example.com' })
Object.assign(customers[6], { name:'Camila Rojas', initials:'CR', country:'Perú', language:'ES', visits:23, spend:3190, points:5780, tier:'Insider', lastVisit:'Hace 2 días', referrals:6, status:'Frecuente', email:'camila.rojas@example.com' })
export const rewards:Reward[]=[
  {id:'r1',name:'Café de la casa',description:'Un café peruano a elección',points:350,type:'Bebida gratis',active:true},
  {id:'r2',name:'10% en tu próxima visita',description:'Válido en Patio Central',points:700,type:'Descuento',active:true},
  {id:'r3',name:'Postre para compartir',description:'Elige cualquier postre de la carta',points:1100,type:'Producto gratis',tier:'Frecuente',active:true},
  {id:'r4',name:'Experiencia del chef',description:'Menú especial para dos personas',points:4000,type:'Experiencia',tier:'Insider',active:true},
]
export const campaigns:Campaign[]=[
  {id:'c1',name:'Vuelve este jueves',channel:'WhatsApp',audience:'Inactivos 30 días',status:'Completada',sent:76,returned:18,revenue:1640},
  {id:'c2',name:'Café doble puntos',channel:'Email',audience:'Clientes frecuentes',status:'Enviada',sent:128,returned:21,revenue:2180},
  {id:'c3',name:'Bienvenida septiembre',channel:'SMS',audience:'Nuevos clientes',status:'Programada',sent:0,returned:0,revenue:0},
]
export const chartData=[{name:'Abr',clientes:82,visitas:128,ventas:5900},{name:'May',clientes:96,visitas:154,ventas:6800},{name:'Jun',clientes:105,visitas:172,ventas:7450},{name:'Jul',clientes:121,visitas:201,ventas:8920},{name:'Ago',clientes:132,visitas:224,ventas:10300},{name:'Sep',clientes:144,visitas:251,ventas:11840}]
export const activity=[
  {name:'Lucía Flores',action:'registró una visita',value:'+83 pts',time:'Hace 4 min'},
  {name:'James Smith',action:'canjeó Café de la casa',value:'-350 pts',time:'Hace 18 min'},
  {name:'Mateo Vargas',action:'refirió a un amigo',value:'+150 pts',time:'Hace 42 min'},
  {name:'Sofía Mendoza',action:'alcanzó nivel Insider',value:'Nuevo nivel',time:'Hace 1 h'},
]
