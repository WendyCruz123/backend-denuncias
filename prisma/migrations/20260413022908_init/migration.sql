-- CreateTable
CREATE TABLE "aer_roles" (
    "idroles" UUID NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(200),
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_roles_pkey" PRIMARY KEY ("idroles")
);

-- CreateTable
CREATE TABLE "aer_persona" (
    "idpersona" UUID NOT NULL,
    "nombres" VARCHAR(150) NOT NULL,
    "apellidos" VARCHAR(150) NOT NULL,
    "celular" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "ci" VARCHAR(30) NOT NULL,
    "tipo_persona" VARCHAR(30) NOT NULL DEFAULT 'FUNCIONARIO',
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_persona_pkey" PRIMARY KEY ("idpersona")
);

-- CreateTable
CREATE TABLE "aer_area" (
    "idarea" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(200),
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_area_pkey" PRIMARY KEY ("idarea")
);

-- CreateTable
CREATE TABLE "aer_usuario" (
    "idusers" UUID NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "persona_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_usuario_pkey" PRIMARY KEY ("idusers")
);

-- CreateTable
CREATE TABLE "aer_rol_usuario" (
    "id_rol_usuario" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "fecha_inicio" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" DATE,
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_rol_usuario_pkey" PRIMARY KEY ("id_rol_usuario")
);

-- CreateTable
CREATE TABLE "aer_categoria" (
    "idcategoria" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "area_id" UUID NOT NULL,
    "ley_respaldo" VARCHAR(255),
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_categoria_pkey" PRIMARY KEY ("idcategoria")
);

-- CreateTable
CREATE TABLE "aer_denuncia" (
    "iddenuncia" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "celular_contacto" VARCHAR(30) NOT NULL,
    "nombres_denunciante" VARCHAR(150),
    "apellidos_denunciante" VARCHAR(150),
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "latitud" DECIMAL(10,7),
    "longitud" DECIMAL(10,7),
    "direccion_texto" VARCHAR(250),
    "detalle_categoria_otro" VARCHAR(200),
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_denuncia_pkey" PRIMARY KEY ("iddenuncia")
);

-- CreateTable
CREATE TABLE "aer_estado" (
    "idestado" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "orden" INTEGER NOT NULL,
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_estado_pkey" PRIMARY KEY ("idestado")
);

-- CreateTable
CREATE TABLE "aer_denuncia_estado" (
    "id_denuncia_estado" UUID NOT NULL,
    "estado_id" UUID NOT NULL,
    "denuncia_id" UUID NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_denuncia_estado_pkey" PRIMARY KEY ("id_denuncia_estado")
);

-- CreateTable
CREATE TABLE "aer_solucion" (
    "id_solucion" UUID NOT NULL,
    "id_denuncia" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_solucion" TIMESTAMP(3) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREADO',
    "_usuario_creacion" UUID,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" UUID,
    "_fecha_modificacion" TIMESTAMP(3),

    CONSTRAINT "aer_solucion_pkey" PRIMARY KEY ("id_solucion")
);

-- CreateTable
CREATE TABLE "aer_archivo" (
    "id_archivo" UUID NOT NULL,
    "solucion_id" UUID,
    "denuncia_id" UUID,
    "url_archivo" TEXT NOT NULL,
    "tipo_archivo" VARCHAR(20) NOT NULL,
    "nombre_original" VARCHAR(255),
    "descripcion" TEXT,
    "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aer_archivo_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateIndex
CREATE UNIQUE INDEX "aer_roles_nombre_key" ON "aer_roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "aer_usuario_username_key" ON "aer_usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "aer_usuario_persona_id_key" ON "aer_usuario"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "aer_estado_nombre_key" ON "aer_estado"("nombre");

-- AddForeignKey
ALTER TABLE "aer_usuario" ADD CONSTRAINT "aer_usuario_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "aer_persona"("idpersona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_usuario" ADD CONSTRAINT "aer_usuario_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "aer_area"("idarea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_rol_usuario" ADD CONSTRAINT "aer_rol_usuario_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "aer_roles"("idroles") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_rol_usuario" ADD CONSTRAINT "aer_rol_usuario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aer_usuario"("idusers") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_categoria" ADD CONSTRAINT "aer_categoria_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "aer_area"("idarea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_denuncia" ADD CONSTRAINT "aer_denuncia_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "aer_categoria"("idcategoria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_denuncia_estado" ADD CONSTRAINT "aer_denuncia_estado_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "aer_estado"("idestado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_denuncia_estado" ADD CONSTRAINT "aer_denuncia_estado_denuncia_id_fkey" FOREIGN KEY ("denuncia_id") REFERENCES "aer_denuncia"("iddenuncia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_solucion" ADD CONSTRAINT "aer_solucion_id_denuncia_fkey" FOREIGN KEY ("id_denuncia") REFERENCES "aer_denuncia"("iddenuncia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_solucion" ADD CONSTRAINT "aer_solucion_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "aer_area"("idarea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_archivo" ADD CONSTRAINT "aer_archivo_solucion_id_fkey" FOREIGN KEY ("solucion_id") REFERENCES "aer_solucion"("id_solucion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aer_archivo" ADD CONSTRAINT "aer_archivo_denuncia_id_fkey" FOREIGN KEY ("denuncia_id") REFERENCES "aer_denuncia"("iddenuncia") ON DELETE SET NULL ON UPDATE CASCADE;
