import type { DemoJourney } from './types'

const step = (id: string, route: string, target: string, title: string, description: string, presenterScript: string, extra: Partial<DemoJourney['steps'][number]> = {}) => ({ id, route, target, title, description, presenterScript, position: 'right' as const, ...extra })

export const journeys: DemoJourney[] = [
  {
    id: 'returning-customer', title: 'Haz que un cliente vuelva', outcome: 'Recuperar clientes inactivos.', duration: '5 min', roles: ['Dueño', 'Marketing'], startingPoint: 'Dashboard',
    steps: [
      step('return-dashboard', '/app', '[data-demo="dashboard-opportunity"]', 'La oportunidad aparece sola', 'Loopia prioriza la acción de mayor impacto.', 'Primero mostramos el negocio, no el módulo. Aquí Loopia señala dónde está la oportunidad.', { prospectQuestion: '¿Cómo identifican hoy a los clientes que llevan varias semanas sin volver?' }),
      step('return-customer', '/app/customers/CUS-0004', '[data-demo="customer-insight"]', 'Cliente en riesgo', 'Sarah Miller lleva aproximadamente 32 días sin regresar.', 'Sarah ha visitado varias veces, pero lleva 32 días sin volver. Loopia convierte ese comportamiento en una señal accionable.'),
      step('return-insight', '/app/customers/CUS-0004', '[data-demo="customer-insight"]', 'Insight de inactividad', 'El equipo entiende por qué conviene actuar ahora.', 'No necesitas revisar cliente por cliente: la plataforma resume el contexto y sugiere una acción relevante.'),
      step('return-campaign', '/app/campaigns', '[data-demo="campaign-builder"]', 'Campaña de recuperación', 'Crea un mensaje para un segmento concreto.', 'En lugar de enviar la misma promoción a toda la base, actuamos sobre clientes inactivos con una oferta específica.', { requiresAction: 'Abrir el constructor de campaña' }),
      step('return-result', '/app/reports', '[data-demo="reports-result"]', 'Sarah regresa', 'La conversión queda atribuida y medible.', 'El cierre de la historia es medible: Sarah vuelve y el negocio puede ver qué campaña generó esa visita.'),
    ],
  },
  {
    id: 'ambassadors', title: 'Convierte clientes en embajadores', outcome: 'Generar nuevos clientes mediante referidos.', duration: '7 min', roles: ['Dueño', 'Cliente'], startingPoint: 'Perfil de cliente',
    steps: [
      step('referral-profile', '/app/customers/CUS-0003', '[data-demo="customer-insight"]', 'Un cliente satisfecho recomienda', 'El perfil muestra el potencial de Mateo como embajador.', 'Mateo ya conoce el negocio y tiene razones para recomendarlo. La oportunidad empieza en una relación existente.'),
      step('referral-activity', '/app/referrals', '[data-demo="referral-funnel"]', 'La recomendación se puede seguir', 'La empresa ve invitaciones y conversiones.', 'El equipo no solo ve un enlace compartido: ve el avance completo hasta la primera visita.'),
      step('referral-share', '/portal', '[data-demo="portal-referral"]', 'El cliente comparte desde su móvil', 'La experiencia de referir ocurre donde el cliente ya está.', 'Para el cliente es una acción sencilla: compartir un enlace, sin explicar un programa complicado.', { role: 'customer' }),
      step('referral-register', '/join', '[data-demo="join-form"]', 'El nuevo cliente se registra', 'El alta simulada mantiene el recorrido corto.', 'El referido entra con una experiencia ligera y entiende inmediatamente qué recibe.'),
      step('referral-visit', '/app/visits', '[data-demo="visit-flow"]', 'Completa su primera visita', 'El negocio registra la visita y atribuye el origen.', 'La conversión se confirma con una visita real, no solo con un clic.'),
      step('referral-results', '/app/referrals', '[data-demo="referral-funnel"]', 'Se emiten las recompensas', 'Ambos clientes reciben el beneficio definido.', 'El sistema cierra el ciclo y deja claro cuánto aportó cada embajador.'),
    ],
  },
  {
    id: 'opportunity-campaign', title: 'De oportunidad a campaña', outcome: 'Mostrar un flujo inteligente de crecimiento.', duration: '5 min', roles: ['Dueño', 'Marketing'], startingPoint: 'Dashboard',
    steps: [
      step('campaign-opportunity', '/app', '[data-demo="dashboard-opportunity"]', 'Una señal concreta', '82 clientes están inactivos por más de 30 días.', 'La oportunidad ya está expresada en términos de negocio: 82 clientes que podrían volver.'),
      step('campaign-segment', '/app/campaigns', '[data-demo="campaign-audience"]', 'Segmento sugerido', 'Loopia propone una audiencia útil, no una lista genérica.', 'La sugerencia reduce el trabajo manual y mantiene la campaña enfocada.'),
      step('campaign-message', '/app/campaigns', '[data-demo="campaign-builder"]', 'Mensaje recomendado', 'El constructor adapta la propuesta al objetivo.', 'El mensaje parte del comportamiento observado y puede editarse antes de enviarlo.'),
      step('campaign-schedule', '/app/campaigns', '[data-demo="campaign-builder"]', 'Programar y medir', 'El equipo elige canal, horario y resultado esperado.', 'La campaña termina con una decisión operativa clara y una métrica que se puede revisar.'),
      step('campaign-result', '/app/reports', '[data-demo="reports-result"]', 'Resultado simulado', 'La atribución conecta campaña con retorno.', 'Así se transforma una señal de datos en una acción que el dueño puede defender.'),
    ],
  },
  {
    id: 'customer-experience', title: 'Así lo vive tu cliente', outcome: 'Mostrar la experiencia completa de fidelización.', duration: '7 min', roles: ['Cliente'], startingPoint: 'Registro QR',
    steps: [
      step('customer-register', '/join', '[data-demo="join-form"]', 'Registro simple', 'El cliente empieza con QR y OTP.', 'La relación comienza en segundos, sin descargar una aplicación.'),
      step('customer-portal', '/portal', '[data-demo="portal-hero"]', 'Un portal que explica el valor', 'Puntos, nivel y próximo motivo para volver aparecen juntos.', 'El cliente entiende qué ha ganado y qué puede hacer después.', { role: 'customer' }),
      step('customer-progress', '/portal', '[data-demo="portal-progress"]', 'Progreso visible', 'El nivel y el desafío hacen tangible la recurrencia.', 'La fidelidad funciona mejor cuando el siguiente paso está a la vista.', { role: 'customer' }),
      step('customer-reward', '/portal', '[data-demo="portal-reward"]', 'Recompensa relevante', 'El beneficio aparece conectado al progreso.', 'No es un cupón aislado: es una razón concreta para regresar.', { role: 'customer' }),
      step('customer-qr', '/portal', '[data-demo="portal-navigation"]', 'QR de membresía', 'La identificación está siempre disponible.', 'En la siguiente visita, el cliente solo muestra su QR.', { role: 'customer' }),
      step('customer-referral', '/portal', '[data-demo="portal-referral"]', 'Compartir la experiencia', 'El cliente puede invitar a alguien cercano.', 'La mejor fidelidad también trae nuevas relaciones.', { role: 'customer' }),
    ],
  },
  {
    id: 'fast-visit', title: 'Una visita en menos de 10 segundos', outcome: 'Mostrar la simplicidad para el personal.', duration: '3 min', roles: ['Personal'], startingPoint: 'Vista Personal',
    steps: [
      step('staff-view', '/app/visits', '[data-demo="visit-flow"]', 'Vista personal', 'El equipo ve una sola acción principal.', 'El personal no necesita aprender un sistema complejo: escanea y confirma.', { role: 'staff' }),
      step('staff-recognized', '/app/visits', '[data-demo="visit-flow"]', 'Cliente reconocido', 'El perfil aparece inmediatamente.', 'La persona queda reconocida sin buscar manualmente en una lista.', { role: 'staff' }),
      step('staff-points', '/app/visits', '[data-demo="visit-flow"]', 'Puntos calculados', 'El monto de compra produce una recompensa clara.', 'La operación mantiene el ritmo del servicio y reduce errores.', { role: 'staff' }),
      step('staff-confirm', '/app/visits', '[data-demo="visit-flow"]', 'Confirmar visita', 'Un último toque cierra el registro.', 'Menos entrenamiento, menos fricción y una experiencia consistente.', { role: 'staff' }),
    ],
  },
  {
    id: 'loyalty-setup', title: 'Configura tu programa de fidelidad', outcome: 'Mostrar cómo el negocio personaliza su programa.', duration: '5 min', roles: ['Dueño'], startingPoint: 'Fidelización',
    steps: [
      step('loyalty-overview', '/app/loyalty', '[data-demo="loyalty-workspace"]', 'Una vista del programa', 'El dueño entiende cómo se conectan reglas y beneficios.', 'La configuración parte de una visión completa, no de pantallas aisladas.'),
      step('loyalty-rules', '/app/loyalty', '[data-demo="loyalty-workspace"]', 'Reglas y niveles', 'Puntos, niveles y desafíos se ajustan al negocio.', 'La operación puede empezar simple y crecer con el comportamiento observado.'),
      step('loyalty-rewards', '/app/rewards', '[data-demo="reward-workspace"]', 'Recompensas concretas', 'El equipo define qué vale la pena ganar.', 'El beneficio debe ser atractivo para el cliente y sostenible para el negocio.'),
      step('loyalty-preview', '/portal', '[data-demo="portal-hero"]', 'Vista del cliente', 'La configuración se convierte en una experiencia móvil.', 'Antes de cerrar, mostramos cómo se ve la decisión del lado del cliente.', { role: 'customer' }),
    ],
  },
  {
    id: 'business-network', title: 'Haz crecer una red de negocios', outcome: 'Mostrar el valor futuro de una red conectada.', duration: '5 min', roles: ['Dueño', 'Cliente'], startingPoint: 'Red de negocios', future: true,
    steps: [
      step('network-partners', '/app/partners', '[data-demo="partner-network"]', 'Red de negocios', 'Los negocios comparten oportunidades entre sí.', 'Esta capacidad está simulada como una vista de futuro de Loopia.'),
      step('network-offer', '/app/partners', '[data-demo="partner-network"]', 'Oferta cruzada', 'Una promoción conecta dos experiencias locales.', 'La red amplía el valor sin perder la atribución.'),
      step('network-customer', '/portal', '[data-demo="portal-reward"]', 'Beneficio desbloqueado', 'El cliente recibe una razón para conocer otro negocio.', 'La promesa se vive desde el móvil del cliente.', { role: 'customer' }),
      step('network-result', '/app/partners', '[data-demo="partner-network"]', 'Conversión atribuida', 'El negocio ve el resultado de la colaboración.', 'El objetivo es probar el potencial de la red antes de conectarla a datos reales.'),
    ],
  },
  {
    id: 'multi-location', title: 'Gestiona varios locales', outcome: 'Mostrar una operación consolidada por sede.', duration: '5 min', roles: ['Dueño', 'Manager'], startingPoint: 'Organización',
    steps: [
      step('locations-org', '/app/locations', '[data-demo="locations-workspace"]', 'Vista de organización', 'Todas las sedes se entienden en una sola pantalla.', 'El dueño conserva una lectura general sin perder el detalle local.'),
      step('locations-switch', '/app/locations', '[data-demo="locations-workspace"]', 'Cambiar de local', 'Cada sede conserva su contexto operativo.', 'La comparación empieza por una navegación sencilla entre locales.'),
      step('locations-kpis', '/app/reports', '[data-demo="reports-result"]', 'Comparar resultados', 'KPIs y actividad se pueden leer lado a lado.', 'La gestión multi-local convierte datos dispersos en decisiones comparables.'),
      step('locations-consolidated', '/app', '[data-demo="dashboard-opportunity"]', 'Volver a la vista consolidada', 'El negocio termina con una lectura común.', 'Una organización puede actuar localmente y aprender en conjunto.'),
    ],
  },
  {
    id: 'quick-demo', title: 'Demo rápida', outcome: 'Contar la historia principal en aproximadamente 3 minutos.', duration: '3 min', roles: ['Dueño', 'Cliente'], startingPoint: 'Dashboard',
    steps: [
      step('quick-dashboard', '/app', '[data-demo="dashboard-opportunity"]', 'La oportunidad', 'El dashboard muestra qué merece atención.', 'Loopia empieza con una oportunidad visible.'),
      step('quick-customer', '/app/customers/CUS-0004', '[data-demo="customer-insight"]', 'La persona', 'La señal se conecta con Sarah Miller.', 'Vemos la historia detrás del número.'),
      step('quick-referral', '/app/referrals', '[data-demo="referral-funnel"]', 'El crecimiento', 'Los clientes también pueden traer nuevos clientes.', 'La fidelización se convierte en adquisición.'),
      step('quick-portal', '/portal', '[data-demo="portal-hero"]', 'La experiencia', 'Todo termina en un portal móvil claro.', 'El cliente ve el valor y el siguiente motivo para volver.', { role: 'customer' }),
      step('quick-impact', '/app/impact', '[data-demo="impact-summary"]', 'El impacto', 'El negocio puede traducir la historia a una hipótesis.', 'Cerramos con una conversación sobre el potencial, no con una promesa.', { role: 'owner' }),
    ],
  },
  {
    id: 'full-demo', title: 'Demo completa', outcome: 'Un recorrido de 10–12 minutos por la historia completa.', duration: '10–12 min', roles: ['Dueño', 'Personal', 'Cliente'], startingPoint: 'Dashboard',
    steps: [
      step('full-opportunity', '/app', '[data-demo="dashboard-opportunity"]', 'Oportunidad de negocio', 'El recorrido comienza con una señal.', 'Primero entendemos el problema que el negocio quiere resolver.'),
      step('full-customer', '/app/customers/CUS-0004', '[data-demo="customer-insight"]', 'Cliente en riesgo', 'Sarah representa a un cliente que puede regresar.', 'La señal se vuelve humana y accionable.'),
      step('full-campaign', '/app/campaigns', '[data-demo="campaign-builder"]', 'Acción de recuperación', 'Se crea una campaña segmentada.', 'La plataforma ayuda a pasar de insight a acción.'),
      step('full-staff', '/app/visits', '[data-demo="visit-flow"]', 'Operación simple', 'El personal registra la visita rápidamente.', 'La estrategia solo funciona si la operación puede ejecutarla.', { role: 'staff' }),
      step('full-portal', '/portal', '[data-demo="portal-hero"]', 'Experiencia del cliente', 'El cliente ve puntos, progreso y recompensas.', 'El resultado es una relación visible para el cliente.', { role: 'customer' }),
      step('full-impact', '/app/impact', '[data-demo="impact-summary"]', 'Conversación de impacto', 'El dueño estima el valor potencial.', 'Cerramos conectando experiencia y resultado de negocio.', { role: 'owner' }),
    ],
  },
]

export const getJourney = (id: string) => journeys.find(journey => journey.id === id)
