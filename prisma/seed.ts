import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

type EstadoMap = Record<'RECIBIDO' | 'EN PROCESO' | 'SOLUCIONADO' | 'RECHAZADO', { id: string; orden: number }>
type RoleMap = Record<'SUPERADMIN' | 'ADMIN' | 'FUNCIONARIO', { id: string }>
type AreaMap = Record<string, { id: string; nombre: string }>
type CategoriaMap = Record<string, { id: string; nombre: string; areaId: string }>
type UsuarioMap = Record<string, { id: string; username: string; areaId: string }>

function decimal(value: number) {
  return new Prisma.Decimal(value)
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function upsertRole(nombre: string, descripcion: string) {
  return prisma.rol.upsert({
    where: { nombre },
    update: {
      descripcion,
      estadoRegistro: 'ACTIVO',
      transaccion: 'ACTUALIZADO',
    },
    create: {
      nombre,
      descripcion,
    },
  })
}

async function upsertEstado(nombre: string, orden: number) {
  return prisma.estado.upsert({
    where: { nombre },
    update: {
      orden,
      estadoRegistro: 'ACTIVO',
      transaccion: 'ACTUALIZADO',
    },
    create: {
      nombre,
      orden,
    },
  })
}

async function upsertArea(nombre: string, descripcion: string) {
  const existente = await prisma.area.findFirst({
    where: { nombre },
  })

  if (existente) {
    return prisma.area.update({
      where: { id: existente.id },
      data: {
        descripcion,
        estadoRegistro: 'ACTIVO',
        transaccion: 'ACTUALIZADO',
      },
    })
  }

  return prisma.area.create({
    data: {
      nombre,
      descripcion,
    },
  })
}

async function upsertCategoria(
  nombre: string,
  descripcion: string,
  areaId: string,
  leyRespaldo?: string,
) {
  const existente = await prisma.categoria.findFirst({
    where: {
      nombre,
      areaId,
    },
  })

  if (existente) {
    return prisma.categoria.update({
      where: { id: existente.id },
      data: {
        descripcion,
        leyRespaldo,
        estadoRegistro: 'ACTIVO',
        transaccion: 'ACTUALIZADO',
      },
      include: {
        area: true,
      },
    })
  }

  return prisma.categoria.create({
    data: {
      nombre,
      descripcion,
      areaId,
      leyRespaldo,
    },
    include: {
      area: true,
    },
  })
}

async function upsertPersona(data: {
  nombres: string
  apellidos: string
  celular: string
  email: string
  ci: string
  tipoPersona: string
}) {
  const existente = await prisma.persona.findFirst({
    where: { ci: data.ci },
  })

  if (existente) {
    return prisma.persona.update({
      where: { id: existente.id },
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        celular: data.celular,
        email: data.email,
        tipoPersona: data.tipoPersona,
        estadoRegistro: 'ACTIVO',
        transaccion: 'ACTUALIZADO',
      },
    })
  }

  return prisma.persona.create({
    data,
  })
}

async function upsertUsuario(data: {
  username: string
  ci: string
  nombres: string
  apellidos: string
  celular: string
  areaId: string
  tipoPersona: string
}) {
  const passwordPlano = `${data.ci}_AER`
  const passwordHash = await bcrypt.hash(passwordPlano, 10)

  const persona = await upsertPersona({
    nombres: data.nombres,
    apellidos: data.apellidos,
    celular: data.celular,
    email: data.username,
    ci: data.ci,
    tipoPersona: data.tipoPersona,
  })

  const existente = await prisma.usuario.findUnique({
    where: { username: data.username },
  })

  if (existente) {
    const usuario = await prisma.usuario.update({
      where: { id: existente.id },
      data: {
        passwordHash,
        personaId: persona.id,
        areaId: data.areaId,
        estadoRegistro: 'ACTIVO',
        transaccion: 'ACTUALIZADO',
      },
      include: {
        persona: true,
        area: true,
      },
    })

    return { usuario, passwordPlano }
  }

  const usuario = await prisma.usuario.create({
    data: {
      username: data.username,
      passwordHash,
      personaId: persona.id,
      areaId: data.areaId,
    },
    include: {
      persona: true,
      area: true,
    },
  })

  return { usuario, passwordPlano }
}

async function ensureRolUsuario(userId: string, roleId: string) {
  const existente = await prisma.rolUsuario.findFirst({
    where: {
      userId,
      roleId,
      estadoRegistro: 'ACTIVO',
    },
  })

  if (existente) return existente

  return prisma.rolUsuario.create({
    data: {
      userId,
      roleId,
    },
  })
}

async function crearArchivoDenuncia(denunciaId: string, index: number) {
  const nombre = `demo-denuncia-${denunciaId.slice(0, 6)}-${index}.jpg`
  return prisma.archivo.create({
    data: {
      denunciaId,
      urlArchivo: `/uploads/${nombre}`,
      tipoArchivo: 'image/jpeg',
      nombreOriginal: nombre,
      descripcion: `Archivo de evidencia ${index}`,
    },
  })
}

async function crearArchivoSolucion(solucionId: string, index: number) {
  const tipos = [
    {
      tipoArchivo: 'image/jpeg',
      ext: 'jpg',
    },
    {
      tipoArchivo: 'application/pdf',
      ext: 'pdf',
    },
  ]

  const tipo = tipos[(index - 1) % tipos.length]
  const nombre = `demo-solucion-${solucionId.slice(0, 6)}-${index}.${tipo.ext}`

  return prisma.archivo.create({
    data: {
      solucionId,
      urlArchivo: `/uploads/${nombre}`,
      tipoArchivo: tipo.tipoArchivo,
      nombreOriginal: nombre,
      descripcion: `Archivo de solución ${index}`,
    },
  })
}

async function crearHistorialEstado(
  denunciaId: string,
  estadoId: string,
  fechaCambio: Date,
  comentario: string,
) {
  return prisma.denunciaEstado.create({
    data: {
      denunciaId,
      estadoId,
      fechaCambio,
      comentario,
      fechaCreacion: fechaCambio,
    },
  })
}

async function limpiarDatosDemo() {
  await prisma.archivo.deleteMany({
    where: {
      OR: [
        { nombreOriginal: { startsWith: 'demo-denuncia-' } },
        { nombreOriginal: { startsWith: 'demo-solucion-' } },
      ],
    },
  })

  await prisma.solucion.deleteMany({
    where: {
      OR: [
        { titulo: { startsWith: 'Intervención realizada - ' } },
        { titulo: { startsWith: 'Caso rechazado - ' } },
      ],
    },
  })

  await prisma.denunciaEstado.deleteMany({
    where: {
      comentario: {
        contains: '[SEED]',
      },
    },
  })

  await prisma.denuncia.deleteMany({
    where: {
      descripcion: {
        startsWith: '[SEED]',
      },
    },
  })
}

async function main() {
  console.log('🌱 Iniciando seed...')

  await limpiarDatosDemo()

  const roles = {
    SUPERADMIN: await upsertRole('SUPERADMIN', 'Control total del sistema'),
    ADMIN: await upsertRole('ADMIN', 'Gestión de reportes y consulta global'),
    FUNCIONARIO: await upsertRole('FUNCIONARIO', 'Gestión de denuncias por área'),
  } satisfies RoleMap

  const estados = {
    RECIBIDO: await upsertEstado('RECIBIDO', 1),
    'EN PROCESO': await upsertEstado('EN PROCESO', 2),
    SOLUCIONADO: await upsertEstado('SOLUCIONADO', 3),
    RECHAZADO: await upsertEstado('RECHAZADO', 4),
  } satisfies EstadoMap

  const areaDefs = [
    {
      nombre: 'DEFENSORIA',
      descripcion: 'Atención a violencia familiar, niñez y acoso',
    },
    {
      nombre: 'SEGURIDAD CIUDADANA',
      descripcion: 'Prevención de delitos y protección ciudadana',
    },
    {
      nombre: 'TRANSPORTE',
      descripcion: 'Control y regulación del transporte público',
    },
    {
      nombre: 'MEDIO AMBIENTE',
      descripcion: 'Control de contaminación y basura',
    },
    {
      nombre: 'ANTICORRUPCION',
      descripcion: 'Investigación de actos irregulares',
    },
    {
      nombre: 'ORDEN PUBLICO',
      descripcion: 'Control de actividades en espacios públicos',
    },
  ]

  const areasArr = await Promise.all(
    areaDefs.map((a) => upsertArea(a.nombre, a.descripcion)),
  )

  const areas = Object.fromEntries(
    areasArr.map((a) => [a.nombre, { id: a.id, nombre: a.nombre }]),
  ) as AreaMap

  const categoriaDefs = [
    {
      nombre: 'VIOLENCIA FAMILIAR',
      descripcion: 'Hechos de violencia en el entorno familiar',
      area: 'DEFENSORIA',
      ley: 'Ley 348',
    },
    {
      nombre: 'MALTRATO INFANTIL',
      descripcion: 'Casos que afectan a niñas, niños y adolescentes',
      area: 'DEFENSORIA',
      ley: 'Código Niña, Niño y Adolescente',
    },
    {
      nombre: 'ACOSO',
      descripcion: 'Acoso verbal, físico o psicológico',
      area: 'DEFENSORIA',
      ley: 'Normativa vigente',
    },
    {
      nombre: 'INSEGURIDAD CIUDADANA',
      descripcion: 'Robos, amenazas o hechos de inseguridad',
      area: 'SEGURIDAD CIUDADANA',
      ley: 'Normativa de seguridad ciudadana',
    },
    {
      nombre: 'OTRO',
      descripcion: 'Categoría general para denuncias no clasificadas',
      area: 'SEGURIDAD CIUDADANA',
      ley: 'No aplica',
    },
    {
      nombre: 'TRAMEAJE',
      descripcion: 'Cobros indebidos y maltrato en transporte',
      area: 'TRANSPORTE',
      ley: 'Normativa municipal de transporte',
    },
    {
      nombre: 'CONTAMINACION',
      descripcion: 'Basura, humo, ruido o contaminación ambiental',
      area: 'MEDIO AMBIENTE',
      ley: 'Normativa ambiental vigente',
    },
    {
      nombre: 'CORRUPCION',
      descripcion: 'Soborno, coima o actos irregulares',
      area: 'ANTICORRUPCION',
      ley: 'Ley Marcelo Quiroga Santa Cruz',
    },
    {
      nombre: 'ABUSO DE AUTORIDAD',
      descripcion: 'Uso indebido de funciones o poder',
      area: 'ANTICORRUPCION',
      ley: 'Ley Marcelo Quiroga Santa Cruz',
    },
    {
      nombre: 'CONSUMO DE ALCOHOL O DROGAS',
      descripcion: 'Consumo en vía pública o zonas de riesgo',
      area: 'ORDEN PUBLICO',
      ley: 'Normativa municipal y penal vigente',
    },
  ]

  const categoriasArr = await Promise.all(
    categoriaDefs.map((c) =>
      upsertCategoria(
        c.nombre,
        c.descripcion,
        areas[c.area].id,
        c.ley,
      ),
    ),
  )

  const categorias = Object.fromEntries(
    categoriasArr.map((c) => [
      c.nombre,
      { id: c.id, nombre: c.nombre, areaId: c.areaId },
    ]),
  ) as CategoriaMap

  const usuariosSeed = [
    {
      username: 'superadmin@aer.bo',
      ci: '10000001',
      nombres: 'Sofia',
      apellidos: 'Quispe Mamani',
      celular: '70000001',
      areaId: areas['SEGURIDAD CIUDADANA'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['SUPERADMIN'],
    },
    {
      username: 'admin@aer.bo',
      ci: '10000002',
      nombres: 'Carlos',
      apellidos: 'Flores Nina',
      celular: '70000002',
      areaId: areas['SEGURIDAD CIUDADANA'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['ADMIN'],
    },
    {
      username: 'func.defensoria@aer.bo',
      ci: '10000003',
      nombres: 'Julia',
      apellidos: 'Condori Lima',
      celular: '70000003',
      areaId: areas['DEFENSORIA'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'func.seguridad@aer.bo',
      ci: '10000004',
      nombres: 'Marco',
      apellidos: 'Apaza Choque',
      celular: '70000004',
      areaId: areas['SEGURIDAD CIUDADANA'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'func.transporte@aer.bo',
      ci: '10000005',
      nombres: 'Elena',
      apellidos: 'Yujra Calle',
      celular: '70000005',
      areaId: areas['TRANSPORTE'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'func.ambiente@aer.bo',
      ci: '10000006',
      nombres: 'Victor',
      apellidos: 'Mamani Cruz',
      celular: '70000006',
      areaId: areas['MEDIO AMBIENTE'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'func.anticorrupcion@aer.bo',
      ci: '10000007',
      nombres: 'Patricia',
      apellidos: 'Ticona Quispe',
      celular: '70000007',
      areaId: areas['ANTICORRUPCION'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'func.ordenpublico@aer.bo',
      ci: '10000008',
      nombres: 'Diego',
      apellidos: 'Saire Copa',
      celular: '70000008',
      areaId: areas['ORDEN PUBLICO'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['FUNCIONARIO'],
    },
    {
      username: 'wc1769338@gmail.com',
      ci: '12572299',
      nombres: 'Wendy Carla',
      apellidos: 'Condori Apaza',
      celular: '77777777',
      areaId: areas['DEFENSORIA'].id,
      tipoPersona: 'FUNCIONARIO',
      roles: ['ADMIN'],
    },
  ]

  const usuarios: UsuarioMap = {}

  for (const u of usuariosSeed) {
    const { usuario, passwordPlano } = await upsertUsuario({
      username: u.username,
      ci: u.ci,
      nombres: u.nombres,
      apellidos: u.apellidos,
      celular: u.celular,
      areaId: u.areaId,
      tipoPersona: u.tipoPersona,
    })

    usuarios[u.username] = {
      id: usuario.id,
      username: usuario.username,
      areaId: usuario.areaId,
    }

    for (const role of u.roles) {
      await ensureRolUsuario(usuario.id, roles[role as keyof RoleMap].id)
    }

    console.log(`👤 ${u.username} / ${passwordPlano}`)
  }

  const nombres = [
    ['Luis', 'Mamani'],
    ['Ana', 'Quispe'],
    ['Rosa', 'Apaza'],
    ['Jorge', 'Condori'],
    ['Miriam', 'Choque'],
    ['Pedro', 'Ticona'],
    ['Lucia', 'Flores'],
    ['Mario', 'Calle'],
    ['Sandra', 'Lima'],
    ['Edgar', 'Yujra'],
    ['Nataly', 'Copa'],
    ['Ruben', 'Vilca'],
  ]

  const ubicaciones = [
    'Zona 16 de Julio',
    'Villa Adela',
    'Ciudad Satélite',
    'Senkata',
    'Río Seco',
    'Ceja de El Alto',
    'Villa Dolores',
    'Cosmos 79',
    'Alto Lima',
    'Ballivián',
  ]

  const descripcionesPorCategoria: Record<string, string[]> = {
    'VIOLENCIA FAMILIAR': [
      'Se reporta agresión verbal y física reiterada en un domicilio particular.',
      'Vecinos indican episodios constantes de violencia familiar durante la noche.',
      'Se solicita intervención por amenazas dentro del entorno familiar.',
    ],
    'MALTRATO INFANTIL': [
      'Se observó descuido grave y agresiones hacia un menor.',
      'Se reporta posible negligencia y maltrato psicológico a una niña.',
    ],
    'ACOSO': [
      'Se reporta acoso constante en inmediaciones de una unidad educativa.',
      'La denunciante indica seguimiento y hostigamiento verbal repetido.',
    ],
    'INSEGURIDAD CIUDADANA': [
      'Se reportan robos frecuentes y falta de patrullaje en la zona.',
      'Vecinos denuncian presencia de personas sospechosas en horarios nocturnos.',
      'Se registró un intento de asalto cerca de una parada de minibuses.',
    ],
    'OTRO': [
      'Se reporta una situación de riesgo no contemplada en las categorías existentes.',
      'La denuncia requiere revisión por tratarse de un caso atípico.',
    ],
    'TRAMEAJE': [
      'Se denuncia cobro excesivo e indebido en transporte público.',
      'Choferes realizan trameaje y dejan pasajeros a medio trayecto.',
      'Conductores maltratan verbalmente a usuarios y alteran recorridos.',
    ],
    'CONTAMINACION': [
      'Se reporta acumulación de basura y malos olores en vía pública.',
      'Existe quema de residuos y humo constante en la zona.',
      'Vecinos denuncian ruido excesivo y contaminación ambiental.',
    ],
    'CORRUPCION': [
      'Se denuncia solicitud de dinero para agilizar un trámite.',
      'Se reporta posible cobro irregular en oficina pública.',
    ],
    'ABUSO DE AUTORIDAD': [
      'Funcionario habría utilizado su cargo para amenazar a un ciudadano.',
      'Se reporta trato arbitrario y uso indebido de funciones.',
    ],
    'CONSUMO DE ALCOHOL O DROGAS': [
      'Se reporta consumo de alcohol en vía pública en horarios nocturnos.',
      'Vecinos denuncian presunto consumo de sustancias controladas cerca de una plaza.',
    ],
  }

  const categoriaKeys = Object.keys(categorias)

  const estadosPorLote: Array<'RECIBIDO' | 'EN PROCESO' | 'SOLUCIONADO' | 'RECHAZADO'> = [
    ...Array(10).fill('RECIBIDO'),
    ...Array(8).fill('EN PROCESO'),
    ...Array(12).fill('SOLUCIONADO'),
    ...Array(6).fill('RECHAZADO'),
  ]

  let contador = 1

  for (const estadoFinal of estadosPorLote) {
    const categoriaNombre = randomItem(categoriaKeys)
    const categoria = categorias[categoriaNombre]
    const areaNombre = Object.keys(areas).find((k) => areas[k].id === categoria.areaId) || ''
    const [nombre, apellido] = randomItem(nombres)
    const fechaBase = daysAgo(randomInt(2, 90))
    const anonimo = Math.random() < 0.35

    const denuncia = await prisma.denuncia.create({
      data: {
        categoriaId: categoria.id,
        descripcion: `[SEED] ${randomItem(descripcionesPorCategoria[categoriaNombre])}`,
        celularContacto: `7${randomInt(1000000, 9999999)}`,
        nombresDenunciante: anonimo ? null : nombre,
        apellidosDenunciante: anonimo ? null : apellido,
        anonimo,
        latitud: decimal(-16.45 - Math.random() * 0.08),
        longitud: decimal(-68.10 - Math.random() * 0.08),
        direccionTexto: randomItem(ubicaciones),
        detalleCategoriaOtro:
          categoriaNombre === 'OTRO'
            ? 'Caso general reportado por ciudadanía'
            : null,
        fechaCreacion: fechaBase,
      },
      include: {
        categoria: {
          include: {
            area: true,
          },
        },
      },
    })

    await crearHistorialEstado(
      denuncia.id,
      estados.RECIBIDO.id,
      fechaBase,
      '[SEED] Estado inicial automático',
    )

    const cantidadArchivosDenuncia = randomInt(1, 2)
    for (let i = 1; i <= cantidadArchivosDenuncia; i++) {
      await crearArchivoDenuncia(denuncia.id, i)
    }

    if (estadoFinal === 'EN PROCESO' || estadoFinal === 'SOLUCIONADO' || estadoFinal === 'RECHAZADO') {
      const fechaProceso = addDays(fechaBase, randomInt(1, 5))

      await crearHistorialEstado(
        denuncia.id,
        estados['EN PROCESO'].id,
        fechaProceso,
        '[SEED] Derivación y atención del caso',
      )

      if (estadoFinal === 'SOLUCIONADO' || estadoFinal === 'RECHAZADO') {
        const titulo =
          estadoFinal === 'SOLUCIONADO'
            ? `Intervención realizada - Caso ${contador}`
            : `Caso rechazado - Caso ${contador}`

        const descripcion =
          estadoFinal === 'SOLUCIONADO'
            ? 'Se realizó intervención institucional y se registró solución con respaldo documental.'
            : 'La denuncia fue revisada y rechazada por falta de elementos suficientes o por no corresponder a la competencia del área.'

        const solucion = await prisma.solucion.create({
          data: {
            denunciaId: denuncia.id,
            areaId: categoria.areaId,
            titulo,
            descripcion,
            fechaSolucion: addDays(fechaProceso, randomInt(1, 4)),
          },
        })

        const cantidadArchivosSolucion = randomInt(1, 3)
        for (let i = 1; i <= cantidadArchivosSolucion; i++) {
          await crearArchivoSolucion(solucion.id, i)
        }

        const fechaCierre = addDays(fechaProceso, randomInt(1, 4))

        await crearHistorialEstado(
          denuncia.id,
          estadoFinal === 'SOLUCIONADO'
            ? estados.SOLUCIONADO.id
            : estados.RECHAZADO.id,
          fechaCierre,
          `[SEED] Cierre del caso por ${areaNombre}`,
        )
      }
    }

    contador++
  }

  console.log('✅ Seed completado correctamente')
  console.log('📌 Roles, áreas, categorías, estados, usuarios, denuncias, historiales, soluciones y archivos demo creados')
  console.log('🔐 Todas las contraseñas siguen el patrón: CI + "_AER"')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })