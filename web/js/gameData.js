// === GAME DATA - Focused on Money/Fundraising ===

const ATTRIBUTE_TYPES = {
    capital: { name: 'Capital', color: '#2ecc71', max: 1000 },
    revenue: { name: 'Ingresos', color: '#3498db', max: 100 },
    valuation: { name: 'Valuación', color: '#f39c12', max: 5000 },
    runway: { name: 'Runway (meses)', color: '#27ae60', max: 36 }
};

const PLAYER_CONFIGS = [
    { name: 'Jugador 1', startup: 'TechNova', color: '#60bbff', type: 'human' },
    { name: 'IA 1', startup: 'DataForge', color: '#ff8c6a', type: 'ai' },
    { name: 'IA 2', startup: 'CloudPulse', color: '#c97aff', type: 'ai' },
    { name: 'IA 3', startup: 'GreenByte', color: '#5eff8a', type: 'ai' }
];

const DEFAULT_ATTRIBUTES = {
    capital: 200,
    revenue: 5,
    valuation: 100,
    runway: 24
};

const DECISIONS = [
    {
        title: 'Ronda Pre-Seed',
        description: 'Un angel investor quiere entrar temprano. ¿Aceptás dilución a cambio de capital?',
        options: [
            { text: 'Aceptar $30K por 15% equity', modifiers: { capital: 30, runway: 4 } },
            { text: 'Rechazar y bootstrappear', modifiers: { revenue: 3, valuation: 20 } }
        ]
    },
    {
        title: 'Estrategia de Monetización',
        description: 'Tu producto tiene tracción. ¿Cómo generás ingresos?',
        options: [
            { text: 'Freemium + planes pagos', modifiers: { revenue: 8, capital: -5, valuation: 30 } },
            { text: 'Enterprise con contratos anuales', modifiers: { revenue: 15, capital: -10 } }
        ]
    },
    {
        title: 'Oferta de Inversión Serie A',
        description: 'Un VC te ofrece $500K pero pide el 25% y un board seat.',
        options: [
            { text: 'Aceptar la Serie A', modifiers: { capital: 500, runway: 12, valuation: 2000 } },
            { text: 'Rechazar y crecer orgánico', modifiers: { revenue: 5, valuation: 50 } }
        ]
    },
    {
        title: 'Contratar Equipo de Ventas',
        description: 'Podés escalar ingresos pero necesitás vendedores.',
        options: [
            { text: 'Contratar 3 vendedores', modifiers: { revenue: 20, capital: -40 } },
            { text: 'Seguir con ventas founder-led', modifiers: { revenue: 5, capital: 5 } }
        ]
    },
    {
        title: 'Adquisición Estratégica',
        description: 'Una startup más chica tiene tecnología que necesitás. Cuesta $80K.',
        options: [
            { text: 'Comprar la startup', modifiers: { capital: -80, revenue: 12, valuation: 200 } },
            { text: 'Desarrollar in-house', modifiers: { capital: -20, revenue: 4 } }
        ]
    },
    {
        title: 'Pivot o Persistir',
        description: 'El mercado cambió. Podés pivotar a un modelo B2B más rentable.',
        options: [
            { text: 'Pivotar a B2B', modifiers: { revenue: -5, capital: -30, valuation: 100 } },
            { text: 'Mantener el rumbo B2C', modifiers: { revenue: 3, valuation: -50 } }
        ]
    },
    {
        title: 'Expandir a LATAM',
        description: 'Podés abrir operación en México pero requiere inversión.',
        options: [
            { text: 'Expandir ahora', modifiers: { capital: -60, revenue: 25, valuation: 150 } },
            { text: 'Consolidar mercado local', modifiers: { revenue: 8, capital: 10 } }
        ]
    },
    {
        title: 'CTO externo',
        description: 'Un CTO con experiencia quiere unirse pero pide 10% equity.',
        options: [
            { text: 'Darle el 10%', modifiers: { revenue: 10, valuation: 200, capital: -15 } },
            { text: 'Seguir sin CTO', modifiers: { capital: 5, revenue: 2 } }
        ]
    },
    {
        title: 'Línea de crédito',
        description: 'El banco te ofrece $100K en crédito a tasa alta.',
        options: [
            { text: 'Tomar el crédito', modifiers: { capital: 100, runway: 6 } },
            { text: 'Rechazar la deuda', modifiers: { valuation: 20 } }
        ]
    },
    {
        title: 'Precio del producto',
        description: 'Tus competidores bajan precios. ¿Seguís o mantenés?',
        options: [
            { text: 'Bajar precios 30%', modifiers: { revenue: -8, valuation: -30 } },
            { text: 'Mantener premium', modifiers: { revenue: 5, valuation: 50 } }
        ]
    },
    {
        title: 'Vender datos',
        description: 'Una empresa quiere comprar datos de usuarios. $50K fáciles.',
        options: [
            { text: 'Vender los datos', modifiers: { capital: 50, valuation: -100 } },
            { text: 'Rechazar por ética', modifiers: { valuation: 80, revenue: 3 } }
        ]
    },
    {
        title: 'Evento presencial',
        description: 'Podés organizar un evento de lanzamiento caro pero impactante.',
        options: [
            { text: 'Hacer el evento', modifiers: { capital: -40, revenue: 15, valuation: 60 } },
            { text: 'Lanzar solo online', modifiers: { capital: -5, revenue: 5 } }
        ]
    },
    {
        title: 'Automatizar ops',
        description: 'Invertir en automatización reduce costos a largo plazo.',
        options: [
            { text: 'Invertir en automation', modifiers: { capital: -30, runway: 3, revenue: 5 } },
            { text: 'Mantener procesos manuales', modifiers: { revenue: 2 } }
        ]
    },
    {
        title: 'Partner estratégico',
        description: 'Una empresa grande quiere ser partner exclusivo 2 años.',
        options: [
            { text: 'Firmar exclusividad', modifiers: { revenue: 30, valuation: 100, capital: 20 } },
            { text: 'Mantener independencia', modifiers: { revenue: 5, valuation: 30 } }
        ]
    },
    {
        title: 'Demanda de inversor',
        description: 'Un ex-inversor amenaza con demandar. Podés negociar o pelear.',
        options: [
            { text: 'Negociar $30K', modifiers: { capital: -30, runway: -1 } },
            { text: 'Pelear en juzgado', modifiers: { capital: -10, valuation: -50, runway: -2 } }
        ]
    },
    {
        title: 'Rebrand completo',
        description: 'Tu marca no conecta. Un rebrand cuesta pero puede cambiar todo.',
        options: [
            { text: 'Hacer rebrand', modifiers: { capital: -25, valuation: 80, revenue: 8 } },
            { text: 'Mantener la marca', modifiers: { revenue: 2 } }
        ]
    },
    {
        title: 'Contratar freelancers',
        description: 'Necesitás entregar rápido. ¿Freelancers o equipo interno?',
        options: [
            { text: 'Freelancers', modifiers: { capital: -20, revenue: 10 } },
            { text: 'Equipo interno', modifiers: { capital: -15, revenue: 6, valuation: 30 } }
        ]
    },
    {
        title: 'ICO / Token',
        description: 'Podés lanzar un token para financiar el proyecto.',
        options: [
            { text: 'Lanzar token', modifiers: { capital: 200, valuation: -100 } },
            { text: 'No crypto', modifiers: { valuation: 30 } }
        ]
    },
    {
        title: 'Programa de aceleración',
        description: 'Y Combinator te aceptó pero tenés que mudarte 3 meses a Silicon Valley.',
        options: [
            { text: 'Ir a YC', modifiers: { capital: -40, valuation: 300, revenue: 10, runway: -2 } },
            { text: 'Quedarte en tu ciudad', modifiers: { revenue: 5, capital: 10 } }
        ]
    },
    {
        title: 'Oferta de acqui-hire',
        description: 'Google quiere comprar tu equipo por $200K. Tu producto muere.',
        options: [
            { text: 'Aceptar el acqui-hire', modifiers: { capital: 200, valuation: -500, revenue: -20 } },
            { text: 'Rechazar y seguir', modifiers: { valuation: 50, revenue: 5 } }
        ]
    },
    {
        title: 'Open Source',
        description: 'Podés abrir el código para ganar comunidad pero perdés ventaja competitiva.',
        options: [
            { text: 'Hacer open source', modifiers: { valuation: 100, revenue: -5, capital: -10 } },
            { text: 'Mantener cerrado', modifiers: { revenue: 8, valuation: 20 } }
        ]
    },
    {
        title: 'Campaña de marketing agresiva',
        description: 'Una agencia te ofrece triplicar leads por $50K.',
        options: [
            { text: 'Contratar la agencia', modifiers: { capital: -50, revenue: 25, valuation: 40 } },
            { text: 'Marketing orgánico', modifiers: { revenue: 5, capital: 5 } }
        ]
    },
    {
        title: 'Mudarte a WeWork',
        description: 'Una oficina premium sube la moral pero cuesta $15K/mes.',
        options: [
            { text: 'Mudarme a WeWork', modifiers: { capital: -30, revenue: 8, valuation: 40 } },
            { text: 'Seguir desde casa', modifiers: { capital: 5, runway: 2 } }
        ]
    },
    {
        title: 'White label',
        description: 'Un banco quiere tu producto con su marca. Paga bien pero no te nombran.',
        options: [
            { text: 'Aceptar white label', modifiers: { revenue: 30, capital: 40, valuation: -50 } },
            { text: 'Solo con mi marca', modifiers: { valuation: 60, revenue: 5 } }
        ]
    },
    {
        title: 'Deuda técnica',
        description: 'Tu código es un desastre. ¿Parás a refactorear o seguís tirando features?',
        options: [
            { text: 'Refactorear 2 meses', modifiers: { runway: -2, revenue: -5, valuation: 80 } },
            { text: 'Seguir con features', modifiers: { revenue: 10, valuation: -30 } }
        ]
    },
    {
        title: 'Competidor te ofrece fusión',
        description: 'Tu rival directo propone unir fuerzas. 50/50.',
        options: [
            { text: 'Fusionarse', modifiers: { revenue: 20, valuation: 200, capital: -20 } },
            { text: 'Competir solo', modifiers: { revenue: 5, valuation: 30 } }
        ]
    },
    {
        title: 'Contratar VP de producto',
        description: 'Un VP ex-Mercado Libre está disponible. Pide $30K de signing bonus.',
        options: [
            { text: 'Contratarlo', modifiers: { capital: -30, revenue: 15, valuation: 100 } },
            { text: 'Seguir sin VP', modifiers: { revenue: 3 } }
        ]
    },
    {
        title: 'Patente',
        description: 'Podés patentar tu algoritmo. Cuesta $20K pero protege tu IP.',
        options: [
            { text: 'Patentar', modifiers: { capital: -20, valuation: 150 } },
            { text: 'No patentar', modifiers: { capital: 5 } }
        ]
    },
    {
        title: 'Reality show de startups',
        description: 'Un canal de TV te invita a un reality de emprendedores.',
        options: [
            { text: 'Participar', modifiers: { valuation: 100, revenue: 12, runway: -1 } },
            { text: 'Pasar, mucho ruido', modifiers: { revenue: 3, capital: 5 } }
        ]
    },
    {
        title: 'Subir precios',
        description: 'Tus clientes pagan poco. Podés subir precios 50% pero alguno se va.',
        options: [
            { text: 'Subir precios', modifiers: { revenue: 15, valuation: 30, capital: -5 } },
            { text: 'Mantener precios', modifiers: { revenue: 5, valuation: 10 } }
        ]
    },
    {
        title: 'Hackear el growth',
        description: 'Un growth hacker te propone tácticas agresivas. Borderline spam.',
        options: [
            { text: 'Hacerlo', modifiers: { revenue: 20, valuation: -40, capital: -10 } },
            { text: 'Crecer limpio', modifiers: { revenue: 5, valuation: 30 } }
        ]
    },
    {
        title: 'Programa de referidos',
        description: 'Podés dar $10 por cada referido. Escala rápido pero cuesta.',
        options: [
            { text: 'Lanzar referidos', modifiers: { capital: -25, revenue: 18, valuation: 40 } },
            { text: 'No gastar en referidos', modifiers: { revenue: 4 } }
        ]
    },
    {
        title: 'Pivotear a IA',
        description: 'Todos hablan de IA. Podés agregar GPT a tu producto.',
        options: [
            { text: 'Integrar IA', modifiers: { capital: -20, valuation: 150, revenue: 8 } },
            { text: 'Mantener el foco', modifiers: { revenue: 5, valuation: 20 } }
        ]
    },
    {
        title: 'Vender equity secundario',
        description: 'Un fondo quiere comprar acciones de founders por $80K.',
        options: [
            { text: 'Vender equity', modifiers: { capital: 80, valuation: -100 } },
            { text: 'Mantener mis acciones', modifiers: { valuation: 40 } }
        ]
    },
    {
        title: 'Conferencia internacional',
        description: 'Web Summit te ofrece un stand por $15K. Exposición global.',
        options: [
            { text: 'Ir a Web Summit', modifiers: { capital: -15, revenue: 12, valuation: 60 } },
            { text: 'Ahorrar la plata', modifiers: { capital: 5, revenue: 2 } }
        ]
    }
];

const EVENTS = [
    { name: 'Gran Cliente', description: 'Un cliente enterprise firma un contrato grande.', modifiers: { revenue: 25, valuation: 100 } },
    { name: 'Caída del Mercado', description: 'Los inversores se retiran del mercado. Valuaciones caen.', modifiers: { valuation: -200, runway: -2 } },
    { name: 'Competidor Recauda $10M', description: 'Tu competidor levantó una mega ronda.', modifiers: { valuation: -100, revenue: -5 } },
    { name: 'Artículo en TechCrunch', description: 'Tu startup aparece en TechCrunch. Leads explotan.', modifiers: { revenue: 15, valuation: 150 } },
    { name: 'Churn Masivo', description: 'El 30% de tus clientes cancelaron este mes.', modifiers: { revenue: -20, valuation: -80 } },
    { name: 'Grant Gubernamental', description: 'Ganaste un subsidio no-dilutivo de $40K.', modifiers: { capital: 40, runway: 3 } },
    { name: 'Hackeo de datos', description: 'Hackearon tu base de datos. Perdés clientes y confianza.', modifiers: { revenue: -12, valuation: -120, capital: -15 } },
    { name: 'Viral en TikTok', description: 'Tu producto se hizo viral. Descargas x10.', modifiers: { revenue: 20, valuation: 200 } },
    { name: 'Empleado estrella renuncia', description: 'Tu mejor dev se fue a Google.', modifiers: { revenue: -8, valuation: -40 } },
    { name: 'Regulación favorable', description: 'Nueva ley beneficia a tu industria.', modifiers: { valuation: 150, revenue: 10 } },
    { name: 'Proveedor quiebra', description: 'Tu proveedor clave cerró. Buscás alternativas caras.', modifiers: { capital: -20, runway: -1 } },
    { name: 'Premio de innovación', description: 'Ganaste un premio con $25K y visibilidad.', modifiers: { capital: 25, valuation: 80 } },
    { name: 'Bug en producción', description: 'Un bug grave te costó clientes esta semana.', modifiers: { revenue: -10, valuation: -30 } },
    { name: 'Influencer te recomienda', description: 'Un influencer habló de tu producto gratis.', modifiers: { revenue: 12, valuation: 60 } },
    { name: 'Pandemia 2.0', description: 'Nueva pandemia. Todo remoto, menos gastos de oficina.', modifiers: { capital: 10, revenue: -8, runway: 2 } },
    { name: 'Inversión ángel sorpresa', description: 'Un contacto random te transfiere $20K sin pedir nada.', modifiers: { capital: 20, runway: 2 } },
    { name: 'Demanda colectiva', description: 'Usuarios demandan por privacidad. Costos legales.', modifiers: { capital: -40, valuation: -80 } },
    { name: 'Alianza con unicornio', description: 'Un unicornio quiere integrarte en su plataforma.', modifiers: { revenue: 18, valuation: 120 } },
    { name: 'Tu app fue removida', description: 'Apple te bajó de la App Store por violar términos.', modifiers: { revenue: -15, valuation: -100, capital: -10 } },
    { name: 'Noticia en Forbes', description: 'Forbes te pone en la lista "30 under 30".', modifiers: { valuation: 200, revenue: 8 } },
    { name: 'Caída del dólar', description: 'El tipo de cambio te favoreció. Tus costos bajan.', modifiers: { capital: 30, runway: 2 } },
    { name: 'Cliente cancela contrato', description: 'Tu cliente más grande no renueva.', modifiers: { revenue: -18, capital: -10 } },
    { name: 'Nuevo competidor', description: 'Una startup con $5M entró a tu mercado.', modifiers: { valuation: -80, revenue: -5 } },
    { name: 'API se vuelve viral', description: 'Desarrolladores aman tu API. Integraciones explotan.', modifiers: { revenue: 15, valuation: 120 } },
    { name: 'Fundador enfermo', description: 'Te enfermaste 2 semanas. La operación se frenó.', modifiers: { runway: -1, revenue: -5 } },
    { name: 'Hackathon ganado', description: 'Tu equipo ganó un hackathon de Google.', modifiers: { capital: 15, valuation: 60 } },
    { name: 'Review negativa masiva', description: 'Un thread de Twitter destruyó tu reputación.', modifiers: { revenue: -12, valuation: -60 } },
    { name: 'Oferta de mentor top', description: 'Un ex-CEO de unicornio quiere ser tu mentor gratis.', modifiers: { valuation: 80, revenue: 5 } },
    { name: 'Cambio de gobierno', description: 'Nuevo gobierno pro-tech. Incentivos fiscales.', modifiers: { capital: 20, valuation: 50 } },
    { name: 'Tu socio te roba', description: 'Descubriste que tu socio desvió fondos.', modifiers: { capital: -50, valuation: -100, runway: -2 } },
    { name: 'Partnership con AWS', description: 'Amazon te da $50K en créditos de cloud.', modifiers: { capital: 50, runway: 3 } },
    { name: 'Feature en Product Hunt', description: 'Producto #1 del día en Product Hunt.', modifiers: { revenue: 10, valuation: 80 } },
    { name: 'Empleados se van juntos', description: '3 empleados renunciaron el mismo día para crear su startup.', modifiers: { revenue: -10, valuation: -50 } },
    { name: 'Blockchain hype', description: 'Tu sector está de moda en crypto. Inversores locos.', modifiers: { valuation: 150, capital: 20 } },
    { name: 'Corte de internet', description: 'Un corte de fibra te dejó 3 días sin servicio.', modifiers: { revenue: -8, capital: -5 } }
];

const ROULETTE_SETS = {
    investors: [
        { label: 'Angel: $20K', color: '#2ecc71', modifiers: { capital: 20, runway: 3 }, weight: 2 },
        { label: 'VC: $200K', color: '#3498db', modifiers: { capital: 200, valuation: 800 }, weight: 1 },
        { label: 'Nadie invierte', color: '#7f8c8d', modifiers: { valuation: -30 }, weight: 2 },
        { label: 'Crowdfunding $50K', color: '#f39c12', modifiers: { capital: 50, revenue: 5 }, weight: 1.5 },
        { label: 'Micro VC $80K', color: '#9b59b6', modifiers: { capital: 80, valuation: 200 }, weight: 1.5 },
        { label: 'Aceleradora $30K', color: '#1abc9c', modifiers: { capital: 30, revenue: 8, valuation: 100 }, weight: 1.5 },
        { label: 'Inversor fantasma', color: '#e74c3c', modifiers: { capital: -10, runway: -1 }, weight: 1.5 },
        { label: 'Family & Friends $15K', color: '#f1c40f', modifiers: { capital: 15, runway: 2 }, weight: 2 }
    ],
    market: [
        { label: 'Boom de ventas', color: '#2ecc71', modifiers: { revenue: 20, valuation: 100 }, weight: 1.5 },
        { label: 'Mercado estable', color: '#95a5a6', modifiers: { revenue: 3 }, weight: 2 },
        { label: 'Recesión', color: '#e74c3c', modifiers: { revenue: -10, valuation: -100 }, weight: 1.5 },
        { label: 'Hype de tu sector', color: '#3498db', modifiers: { valuation: 200, revenue: 8 }, weight: 1 },
        { label: 'Mercado saturado', color: '#7f8c8d', modifiers: { revenue: -5, valuation: -30 }, weight: 1.5 },
        { label: 'Nuevo nicho', color: '#9b59b6', modifiers: { revenue: 12, valuation: 60 }, weight: 1.5 }
    ],
    destiny: [
        { label: 'Mega deal $100K', color: '#f1c40f', modifiers: { capital: 100, valuation: 300 }, weight: 1 },
        { label: 'Sin cambios', color: '#7f8c8d', modifiers: { revenue: 1 }, weight: 2 },
        { label: 'Gastos extra', color: '#e74c3c', modifiers: { capital: -30, runway: -1 }, weight: 1.5 },
        { label: 'Revenue boost', color: '#2ecc71', modifiers: { revenue: 15 }, weight: 1.5 },
        { label: 'Golpe de suerte', color: '#f39c12', modifiers: { capital: 60, valuation: 80 }, weight: 1 },
        { label: 'Multa inesperada', color: '#c0392b', modifiers: { capital: -40, valuation: -50 }, weight: 1.5 },
        { label: 'Contrato grande', color: '#1abc9c', modifiers: { revenue: 20, capital: 30 }, weight: 1 },
        { label: 'Nada relevante', color: '#bdc3c7', modifiers: { revenue: 2, capital: 5 }, weight: 2 }
    ],
    clients: [
        { label: '10 clientes nuevos', color: '#2ecc71', modifiers: { revenue: 20, valuation: 80 }, weight: 1.5 },
        { label: 'Churn -5 clientes', color: '#e74c3c', modifiers: { revenue: -10, capital: -5 }, weight: 1.5 },
        { label: 'Cliente enterprise', color: '#f1c40f', modifiers: { revenue: 30, valuation: 150 }, weight: 1 },
        { label: 'Pipeline estancado', color: '#7f8c8d', modifiers: { revenue: 2 }, weight: 2 },
        { label: 'Referido valioso', color: '#3498db', modifiers: { revenue: 15, capital: 10 }, weight: 1.5 },
        { label: 'Cliente moroso', color: '#e67e22', modifiers: { capital: -15, revenue: -3 }, weight: 1.5 }
    ],
    valuation: [
        { label: 'Hype mediático', color: '#9b59b6', modifiers: { valuation: 500, revenue: 5 }, weight: 1 },
        { label: 'Due diligence OK', color: '#2ecc71', modifiers: { valuation: 200, capital: 20 }, weight: 1.5 },
        { label: 'Burbuja estalla', color: '#e74c3c', modifiers: { valuation: -300, capital: -20 }, weight: 1.5 },
        { label: 'Valuación estable', color: '#3498db', modifiers: { valuation: 50 }, weight: 2 },
        { label: 'Comparables suben', color: '#f39c12', modifiers: { valuation: 150 }, weight: 1.5 },
        { label: 'Mercado frío', color: '#7f8c8d', modifiers: { valuation: -80, revenue: -3 }, weight: 1.5 },
        { label: 'Term sheet!', color: '#1abc9c', modifiers: { valuation: 300, capital: 50 }, weight: 0.8 },
        { label: 'Down round', color: '#c0392b', modifiers: { valuation: -200, capital: 30 }, weight: 1.2 }
    ]
};

// Build the 36-tile board - ALL focused on money/fundraising
const TILES = [
    { name: 'Inicio', type: 'positive', modifiers: { capital: 10 }, description: 'Tu startup da sus primeros pasos. Todo comienza aquí.' },
    { name: 'Primer ingreso', type: 'positive', modifiers: { revenue: 5, capital: 5 }, description: 'Tu primer cliente pagó. Los ingresos empiezan a fluir.' },
    { name: 'Pre-Seed', type: 'decision', decisionIndex: 0 },
    { name: 'Servidor caído', type: 'negative', modifiers: { revenue: -3, capital: -5 }, description: 'Tu servidor se cayó en pleno lanzamiento. Perdiste clientes y plata.' },
    { name: 'Hackathon', type: 'positive', modifiers: { capital: 10, valuation: 30 }, description: 'Ganaste un hackathon!', randomCapital: [5, 20] },
    { name: 'Gran Cliente', type: 'event', eventIndex: 0 },
    { name: 'Monetización', type: 'decision', decisionIndex: 1 },
    { name: 'Inversores', type: 'roulette', rouletteSet: 'investors' },
    { name: 'Demanda legal', type: 'negative', modifiers: { capital: -40, revenue: -5 }, description: 'Te llegó una demanda por propiedad intelectual. Abogados caros.' },
    { name: 'Contrato gov', type: 'positive', modifiers: { revenue: 20, capital: 15 }, description: 'Firmaste un contrato con el gobierno. Ingreso estable garantizado.' },
    { name: 'Serie A', type: 'decision', decisionIndex: 2 },
    { name: 'Caída mercado', type: 'event', eventIndex: 1 },
    { name: 'Unicornio', type: 'positive', modifiers: { valuation: 200, revenue: 5 }, description: 'Tu valuación se disparó. La prensa te llama el próximo unicornio.' },
    { name: 'Clientes', type: 'roulette', rouletteSet: 'clients' },
    { name: 'Equipo ventas', type: 'decision', decisionIndex: 3 },
    { name: 'Turno Extra', type: 'special', specialId: 'extra_turn', modifiers: { capital: 5 } },
    { name: 'Competidor', type: 'event', eventIndex: 2 },
    { name: 'MRR crece 40%', type: 'positive', modifiers: { revenue: 18, valuation: 80 }, description: 'Tu revenue recurrente creció un 40% este mes. Los inversores están contentos.' },
    { name: 'Adquisición', type: 'decision', decisionIndex: 4 },
    { name: 'Mercado', type: 'roulette', rouletteSet: 'market' },
    { name: 'Impuestos', type: 'negative', modifiers: { capital: -25, runway: -1 }, description: 'Llegó la AFIP. Impuestos atrasados que no esperabas.' },
    { name: 'Nuevo inversor', type: 'roulette', rouletteSet: 'investors' },
    { name: 'TechCrunch', type: 'event', eventIndex: 3 },
    { name: 'Cash burn alto', type: 'negative', modifiers: { capital: -30, runway: -2 }, description: 'Tus gastos se dispararon. Perdiste capital y tiempo.' },
    { name: 'Pivot', type: 'decision', decisionIndex: 5 },
    { name: 'Deal', type: 'positive', modifiers: { capital: 80, revenue: 10, valuation: 100 }, description: 'Cerraste un deal enorme con un cliente estratégico.', randomCapital: [70, 90] },
    { name: 'Cancelación', type: 'event', eventIndex: 4 },
    { name: 'Destino', type: 'roulette', rouletteSet: 'destiny' },
    { name: 'Cofunder se va', type: 'negative', modifiers: { valuation: -100, revenue: -8 }, description: 'Tu cofundador se fue. El equipo está desmoralizado.' },
    { name: 'Serie B $2M', type: 'positive', modifiers: { capital: 2000, valuation: 5000, runway: 12 }, description: 'Levantaste una Serie B de $2M. Tu startup entró en las grandes ligas.' },
    { name: 'Grant $40K', type: 'event', eventIndex: 5 },
    { name: 'Retrocede', type: 'special', specialId: 'go_back', modifiers: { capital: -10 } },
    { name: 'Valorización', type: 'roulette', rouletteSet: 'valuation' },
    { name: 'Fraude interno', type: 'negative', modifiers: { capital: -100, valuation: -300 }, description: 'Descubriste un fraude interno. Pérdidas millonarias y desconfianza.' },
    { name: 'Adquisición', type: 'positive', modifiers: { capital: 500, valuation: 1000 }, description: 'Una empresa grande quiere comprarte. Oferta irresistible en la mesa.' },
    { name: 'Salida a Bolsa', type: 'positive', modifiers: { capital: 5000, valuation: 10000 }, description: 'Saliste a bolsa. Tu startup es oficialmente una empresa pública.' }
];
