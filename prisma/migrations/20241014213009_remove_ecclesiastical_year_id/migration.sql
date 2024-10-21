-- CreateEnum
CREATE TYPE "blood_type" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('Masculino', 'Femenino');

-- CreateTable
CREATE TABLE "activities" (
    "activity_id" SERIAL NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "club_type_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "activity_time" VARCHAR(10) NOT NULL DEFAULT '09:00',
    "activity_place" TEXT NOT NULL DEFAULT 'place',
    "image" TEXT NOT NULL,
    "platform" INTEGER NOT NULL DEFAULT 0,
    "activity_type" INTEGER NOT NULL DEFAULT 0,
    "link_meet" TEXT,
    "additional_data" TEXT,
    "attendees" JSON,
    "classes" JSON,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER NOT NULL,
    "club_mg_id" INTEGER NOT NULL,
    "club_pathf_id" INTEGER NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "assignments_folders" (
    "assignment_folder_id" SERIAL NOT NULL,
    "folder_id" INTEGER,
    "coordinator_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignment_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_folders_pkey" PRIMARY KEY ("assignment_folder_id")
);

-- CreateTable
CREATE TABLE "attending_clubs_camporees" (
    "attending_clubs_id" SERIAL NOT NULL,
    "camporee_id" INTEGER NOT NULL,
    "camporee_type" VARCHAR(50) NOT NULL,
    "club_id" INTEGER,
    "local_field_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "attending_clubs_camporees_pkey" PRIMARY KEY ("attending_clubs_id")
);

-- CreateTable
CREATE TABLE "attending_members_camporees" (
    "attending_members_id" SERIAL NOT NULL,
    "camporee_id" INTEGER NOT NULL,
    "camporee_type" VARCHAR(50) NOT NULL,
    "user_id" UUID NOT NULL,
    "club_name" VARCHAR(255),
    "local_field_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attending_members_camporees_pkey" PRIMARY KEY ("attending_members_id")
);

-- CreateTable
CREATE TABLE "churches" (
    "church_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "district_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("church_id")
);

-- CreateTable
CREATE TABLE "class_module_progress" (
    "module_progress_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "class_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_module_progress_pkey" PRIMARY KEY ("module_progress_id")
);

-- CreateTable
CREATE TABLE "class_modules" (
    "module_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "class_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_modules_pkey" PRIMARY KEY ("module_id")
);

-- CreateTable
CREATE TABLE "class_section_progress" (
    "section_progress_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "class_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "evidences" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_section_progress_pkey" PRIMARY KEY ("section_progress_id")
);

-- CreateTable
CREATE TABLE "class_sections" (
    "section_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "module_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_sections_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "classes" (
    "class_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "club_type_id" INTEGER NOT NULL,
    "ecclesiastical_year_id" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "club_ideals" (
    "club_ideal_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "ideal_order" INTEGER NOT NULL,
    "club_type_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ideal" TEXT,

    CONSTRAINT "club_ideals_pkey" PRIMARY KEY ("club_ideal_id")
);

-- CreateTable
CREATE TABLE "club_inventory" (
    "club_inventory_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "inventory_category_id" INTEGER,
    "amount" INTEGER DEFAULT 0,
    "club_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "club_inventory_pkey" PRIMARY KEY ("club_inventory_id")
);

-- CreateTable
CREATE TABLE "club_types" (
    "ct_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_types_pkey" PRIMARY KEY ("ct_id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "club_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "local_field_id" INTEGER NOT NULL,
    "address" TEXT,
    "district_id" INTEGER NOT NULL,
    "church_id" INTEGER NOT NULL,
    "coordinates" JSON NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("club_id")
);

-- CreateTable
CREATE TABLE "club_adventurers" (
    "club_adv_id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "souls_target" INTEGER NOT NULL DEFAULT 1,
    "fee" INTEGER NOT NULL DEFAULT 1,
    "meeting_day" TEXT[],
    "meeting_time" TEXT[],
    "club_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "club_typesClub_type_id" INTEGER NOT NULL,

    CONSTRAINT "club_adventurers_pkey" PRIMARY KEY ("club_adv_id")
);

-- CreateTable
CREATE TABLE "club_pathfinders" (
    "club_pathf_id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "souls_target" INTEGER NOT NULL DEFAULT 1,
    "fee" INTEGER NOT NULL DEFAULT 1,
    "meeting_day" TEXT[],
    "meeting_time" TEXT[],
    "club_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "club_typesClub_type_id" INTEGER NOT NULL,

    CONSTRAINT "club_pathfinders_pkey" PRIMARY KEY ("club_pathf_id")
);

-- CreateTable
CREATE TABLE "club_master_guild" (
    "club_mg_id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "souls_target" INTEGER NOT NULL DEFAULT 1,
    "fee" INTEGER NOT NULL DEFAULT 1,
    "meeting_day" TEXT[],
    "meeting_time" TEXT[],
    "club_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "club_master_guild_pkey" PRIMARY KEY ("club_mg_id")
);

-- CreateTable
CREATE TABLE "club_role_assignments" (
    "assignment_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "club_adv_id" INTEGER,
    "club_pathf_id" INTEGER,
    "club_mg_id" INTEGER,
    "ecclesiastical_year_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "club_role_assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "coordinators" (
    "coordinator_id" SERIAL NOT NULL,
    "user_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coordinators_pkey" PRIMARY KEY ("coordinator_id")
);

-- CreateTable
CREATE TABLE "countries" (
    "country_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(8) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "districts" (
    "district_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "local_field_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("district_id")
);

-- CreateTable
CREATE TABLE "ecclesiastical_year" (
    "year_id" SERIAL NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecclesiastical_year_pkey" PRIMARY KEY ("year_id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "enrollment_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "class_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "enrollment_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investiture_status" BOOLEAN,
    "advanced_status" BOOLEAN,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "log_id" SERIAL NOT NULL,
    "procedure_name" VARCHAR(100) NOT NULL,
    "error_message" TEXT NOT NULL,
    "additional_details" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "finances" (
    "finance_id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "club_type_id" INTEGER NOT NULL,
    "club_id" INTEGER NOT NULL,
    "finance_category_id" INTEGER NOT NULL,
    "finance_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "finances_pkey" PRIMARY KEY ("finance_id")
);

-- CreateTable
CREATE TABLE "finances_categories" (
    "finance_category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" INTEGER DEFAULT 0,
    "type" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finances_categories_pkey" PRIMARY KEY ("finance_category_id")
);

-- CreateTable
CREATE TABLE "folders" (
    "folder_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_type" INTEGER,
    "ecclesiastical_year_id" INTEGER,
    "status" VARCHAR(50) DEFAULT 'incompleto',
    "total_points" INTEGER DEFAULT 0,
    "max_points" INTEGER DEFAULT 0,
    "minimum_points" INTEGER DEFAULT 0,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("folder_id")
);

-- CreateTable
CREATE TABLE "folders_modules" (
    "folder_module_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "folder_id" INTEGER,
    "total_points" INTEGER DEFAULT 0,
    "max_points" INTEGER DEFAULT 0,
    "minimum_points" INTEGER DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folders_modules_pkey" PRIMARY KEY ("folder_module_id")
);

-- CreateTable
CREATE TABLE "folders_modules_records" (
    "folder_module_record_id" SERIAL NOT NULL,
    "club_id" INTEGER,
    "folder_id" INTEGER,
    "module_id" INTEGER,
    "points" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "folders_modules_records_pkey" PRIMARY KEY ("folder_module_record_id")
);

-- CreateTable
CREATE TABLE "folders_section_records" (
    "folder_section_record_id" SERIAL NOT NULL,
    "club_id" INTEGER,
    "folder_id" INTEGER,
    "module_id" INTEGER,
    "section_id" INTEGER,
    "points" INTEGER DEFAULT 0,
    "pdf_file" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,
    "evidences" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "folders_section_records_pkey" PRIMARY KEY ("folder_section_record_id")
);

-- CreateTable
CREATE TABLE "folders_sections" (
    "folder_section_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "module_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "total_points" INTEGER DEFAULT 0,
    "max_points" INTEGER DEFAULT 0,
    "minimum_points" INTEGER DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "folders_sections_pkey" PRIMARY KEY ("folder_section_id")
);

-- CreateTable
CREATE TABLE "honors" (
    "honor_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "honor_image" TEXT,
    "honors_category_id" INTEGER NOT NULL,
    "master_honors_id" INTEGER NOT NULL,
    "material_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honors_pkey" PRIMARY KEY ("honor_id")
);

-- CreateTable
CREATE TABLE "honors_categories" (
    "honor_category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "honors_categories_pkey" PRIMARY KEY ("honor_category_id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "inventory_categoty_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" INTEGER DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("inventory_categoty_id")
);

-- CreateTable
CREATE TABLE "local_camporees" (
    "local_camporee_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "local_field_id" INTEGER NOT NULL,
    "includes_adventurers" BOOLEAN DEFAULT false,
    "includes_pathfinders" BOOLEAN DEFAULT false,
    "includes_master_guides" BOOLEAN DEFAULT false,
    "local_camporee_place" TEXT NOT NULL DEFAULT 'Lugar',
    "registration_cost" DECIMAL(10,2),
    "ecclesiastical_year" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_camporees_pkey" PRIMARY KEY ("local_camporee_id")
);

-- CreateTable
CREATE TABLE "local_fields" (
    "local_field_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(8) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "union_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_fields_pkey" PRIMARY KEY ("local_field_id")
);

-- CreateTable
CREATE TABLE "master_honors" (
    "master_honor_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "master_image" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_honors_pkey" PRIMARY KEY ("master_honor_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "permission_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_permission_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "role_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "union_camporee_local_fields" (
    "union_camporee_lf_id" INTEGER NOT NULL,
    "local_field_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "union_camporee_local_fields_pkey" PRIMARY KEY ("union_camporee_lf_id","local_field_id")
);

-- CreateTable
CREATE TABLE "union_camporees" (
    "union_camporee_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "union_id" INTEGER NOT NULL,
    "includes_adventurers" BOOLEAN DEFAULT false,
    "includes_pathfinders" BOOLEAN DEFAULT false,
    "includes_master_guides" BOOLEAN DEFAULT false,
    "union_camporee_place" TEXT NOT NULL DEFAULT 'Lugar',
    "registration_cost" DECIMAL(10,2),
    "ecclesiastical_year" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "union_camporees_pkey" PRIMARY KEY ("union_camporee_id")
);

-- CreateTable
CREATE TABLE "unions" (
    "union_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "abbreviation" VARCHAR(8) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unions_pkey" PRIMARY KEY ("union_id")
);

-- CreateTable
CREATE TABLE "unit_members" (
    "unit_member_id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unit_members_pkey" PRIMARY KEY ("unit_member_id")
);

-- CreateTable
CREATE TABLE "units" (
    "unit_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "captain_id" UUID NOT NULL,
    "secretary_id" UUID NOT NULL,
    "advisor_id" UUID NOT NULL,
    "substitute_advisor_id" UUID,
    "club_id" INTEGER NOT NULL,
    "club_type_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "user_honors" (
    "user_honor_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "honor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_honors_pkey" PRIMARY KEY ("user_honor_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "user_permission_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_permission_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_role_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT auth.uid(),
    "name" VARCHAR(50),
    "paternal_last_name" VARCHAR(50),
    "mother_last_name" VARCHAR(50),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(100) NOT NULL,
    "gender" INTEGER DEFAULT 1,
    "birthday" DATE,
    "tutor_name" VARCHAR(150),
    "tutor_phone" VARCHAR,
    "blood" VARCHAR(5),
    "baptism" BOOLEAN NOT NULL DEFAULT false,
    "baptism_date" DATE,
    "apple_connected" BOOLEAN NOT NULL DEFAULT false,
    "fb_connected" BOOLEAN NOT NULL DEFAULT false,
    "google_connected" BOOLEAN NOT NULL DEFAULT false,
    "user_image" TEXT,
    "country_id" INTEGER,
    "union_id" INTEGER,
    "club_id" INTEGER,
    "access_app" BOOLEAN DEFAULT true,
    "access_panel" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "club_adv_id" INTEGER,
    "club_mg_id" INTEGER,
    "club_pathf_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users_pr" (
    "user_pr_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "date_completed" TIMESTAMP(3),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pr_pkey" PRIMARY KEY ("user_pr_id")
);

-- CreateTable
CREATE TABLE "users_classes" (
    "user_class_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "class_id" INTEGER,
    "investiture" BOOLEAN DEFAULT false,
    "date_investiture" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_classes_pkey" PRIMARY KEY ("user_class_id")
);

-- CreateTable
CREATE TABLE "user_diseases" (
    "user_disease_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "disease_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_diseases_pkey" PRIMARY KEY ("user_disease_id")
);

-- CreateTable
CREATE TABLE "user_allergies" (
    "user_allergies_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "allergy_id" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_allergies_pkey" PRIMARY KEY ("user_allergies_id")
);

-- CreateTable
CREATE TABLE "diseases" (
    "disease_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("disease_id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "allergy_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("allergy_id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "emergency_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "owner_id" UUID NOT NULL,
    "contact_user_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("emergency_id")
);

-- CreateTable
CREATE TABLE "contact_phones" (
    "phone_id" SERIAL NOT NULL,
    "emergency_id" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "phone_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contact_phones_pkey" PRIMARY KEY ("phone_id")
);

-- CreateTable
CREATE TABLE "contact_emails" (
    "emails_id" SERIAL NOT NULL,
    "emergency_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contact_emails_pkey" PRIMARY KEY ("emails_id")
);

-- CreateTable
CREATE TABLE "weekly_records" (
    "record_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "week" INTEGER NOT NULL,
    "attendance" INTEGER NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weekly_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_module_progress_user_id_class_id_module_id_key" ON "class_module_progress"("user_id", "class_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_modules_name_class_id_key" ON "class_modules"("name", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_section_progress_user_id_class_id_module_id_section_i_key" ON "class_section_progress"("user_id", "class_id", "module_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_sections_name_module_id_key" ON "class_sections"("name", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "club_types_name_key" ON "club_types"("name");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_club_adv" ON "club_role_assignments"("club_adv_id");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_club_mg" ON "club_role_assignments"("club_mg_id");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_club_pathf" ON "club_role_assignments"("club_pathf_id");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_role" ON "club_role_assignments"("role_id");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_user" ON "club_role_assignments"("user_id");

-- CreateIndex
CREATE INDEX "idx_club_role_assignments_year" ON "club_role_assignments"("ecclesiastical_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_role_assignment_unique" ON "club_role_assignments"("user_id", "role_id", "club_adv_id", "club_pathf_id", "club_mg_id", "ecclesiastical_year_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "coordinators_user_id_key" ON "coordinators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_abbreviation_key" ON "countries"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_class_id_key" ON "enrollments"("user_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_name_type" ON "finances_categories"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_key" ON "folders"("name");

-- CreateIndex
CREATE UNIQUE INDEX "folders_modules_records_club_id_folder_id_module_id_key" ON "folders_modules_records"("club_id", "folder_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "folders_section_records_club_id_folder_id_module_id_section_key" ON "folders_section_records"("club_id", "folder_id", "module_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "honors_name_key" ON "honors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "honors_categories_name_key" ON "honors_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "local_fields_name_key" ON "local_fields"("name");

-- CreateIndex
CREATE UNIQUE INDEX "local_fields_abbreviation_key" ON "local_fields"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "master_honors_name_key" ON "master_honors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "unions_name_key" ON "unions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unions_abbreviation_key" ON "unions"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "unit_members_user_id_key" ON "unit_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_club_id_key" ON "units"("name", "club_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_classes_user_id_class_id_key" ON "users_classes"("user_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_diseases_user_id_disease_id_key" ON "user_diseases"("user_id", "disease_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_allergies_user_id_allergy_id_key" ON "user_allergies"("user_id", "allergy_id");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_name_key" ON "diseases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_name_key" ON "allergies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_records_user_id_week_key" ON "weekly_records"("user_id", "week");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments_folders" ADD CONSTRAINT "assignments_folders_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "coordinators"("coordinator_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignments_folders" ADD CONSTRAINT "assignments_folders_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("folder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_clubs_camporees" ADD CONSTRAINT "attending_clubs_camporees_camporee_id_fkey" FOREIGN KEY ("camporee_id") REFERENCES "local_camporees"("local_camporee_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_clubs_camporees" ADD CONSTRAINT "attending_clubs_camporees_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_clubs_camporees" ADD CONSTRAINT "attending_clubs_camporees_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_clubs_camporees" ADD CONSTRAINT "attending_clubs_camporees_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_clubs_camporees" ADD CONSTRAINT "attending_clubs_camporees_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_members_camporees" ADD CONSTRAINT "attending_members_camporees_camporee_id_fkey" FOREIGN KEY ("camporee_id") REFERENCES "local_camporees"("local_camporee_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_members_camporees" ADD CONSTRAINT "attending_members_camporees_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attending_members_camporees" ADD CONSTRAINT "attending_members_camporees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "churches" ADD CONSTRAINT "churches_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_module_progress" ADD CONSTRAINT "class_module_progress_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_module_progress" ADD CONSTRAINT "class_module_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_modules" ADD CONSTRAINT "class_modules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_section_progress" ADD CONSTRAINT "class_section_progress_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_section_progress" ADD CONSTRAINT "class_section_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "class_modules"("module_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_ideals" ADD CONSTRAINT "club_ideals_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_inventory" ADD CONSTRAINT "club_inventory_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_inventory" ADD CONSTRAINT "club_inventory_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_inventory" ADD CONSTRAINT "club_inventory_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_inventory" ADD CONSTRAINT "club_inventory_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("church_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("district_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_adventurers" ADD CONSTRAINT "club_adventurers_club_typesClub_type_id_fkey" FOREIGN KEY ("club_typesClub_type_id") REFERENCES "club_types"("ct_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_pathfinders" ADD CONSTRAINT "club_pathfinders_club_typesClub_type_id_fkey" FOREIGN KEY ("club_typesClub_type_id") REFERENCES "club_types"("ct_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_master_guild" ADD CONSTRAINT "club_master_guild_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_ecclesiastical_year_id_fkey" FOREIGN KEY ("ecclesiastical_year_id") REFERENCES "ecclesiastical_year"("year_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "club_role_assignments" ADD CONSTRAINT "club_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "coordinators" ADD CONSTRAINT "coordinators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finances" ADD CONSTRAINT "finances_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "finances_categories"("finance_category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_club_type_fkey" FOREIGN KEY ("club_type") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_ecclesiastical_year_id_fkey" FOREIGN KEY ("ecclesiastical_year_id") REFERENCES "ecclesiastical_year"("year_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_modules" ADD CONSTRAINT "folders_modules_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("folder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("folder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_modules_records" ADD CONSTRAINT "folders_modules_records_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "folders_modules"("folder_module_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("folder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "folders_modules"("folder_module_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_section_records" ADD CONSTRAINT "folders_section_records_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "folders_sections"("folder_section_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "folders_sections" ADD CONSTRAINT "folders_sections_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "folders_modules"("folder_module_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "honors" ADD CONSTRAINT "honors_honors_category_id_fkey" FOREIGN KEY ("honors_category_id") REFERENCES "honors_categories"("honor_category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "honors" ADD CONSTRAINT "honors_master_honors_id_fkey" FOREIGN KEY ("master_honors_id") REFERENCES "master_honors"("master_honor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_camporees" ADD CONSTRAINT "local_camporees_ecclesiastical_year_fkey" FOREIGN KEY ("ecclesiastical_year") REFERENCES "ecclesiastical_year"("year_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_camporees" ADD CONSTRAINT "local_camporees_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_fields" ADD CONSTRAINT "local_fields_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("union_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "union_camporee_local_fields" ADD CONSTRAINT "union_camporee_local_fields_local_field_id_fkey" FOREIGN KEY ("local_field_id") REFERENCES "local_fields"("local_field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "union_camporee_local_fields" ADD CONSTRAINT "union_camporee_local_fields_union_camporee_lf_id_fkey" FOREIGN KEY ("union_camporee_lf_id") REFERENCES "union_camporees"("union_camporee_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "union_camporees" ADD CONSTRAINT "union_camporees_ecclesiastical_year_fkey" FOREIGN KEY ("ecclesiastical_year") REFERENCES "ecclesiastical_year"("year_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "union_camporees" ADD CONSTRAINT "union_camporees_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("union_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_members" ADD CONSTRAINT "unit_members_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_members" ADD CONSTRAINT "unit_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_substitute_advisor_id_fkey" FOREIGN KEY ("substitute_advisor_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_honors" ADD CONSTRAINT "user_honors_honor_id_fkey" FOREIGN KEY ("honor_id") REFERENCES "honors"("honor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_honors" ADD CONSTRAINT "user_honors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "fk_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_club_adv_id_fkey" FOREIGN KEY ("club_adv_id") REFERENCES "club_adventurers"("club_adv_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("club_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_club_mg_id_fkey" FOREIGN KEY ("club_mg_id") REFERENCES "club_master_guild"("club_mg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_club_pathf_id_fkey" FOREIGN KEY ("club_pathf_id") REFERENCES "club_pathfinders"("club_pathf_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("union_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_pr" ADD CONSTRAINT "users_pr_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_classes" ADD CONSTRAINT "users_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_classes" ADD CONSTRAINT "users_classes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_diseases" ADD CONSTRAINT "user_diseases_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "diseases"("disease_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_diseases" ADD CONSTRAINT "user_diseases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_allergy_id_fkey" FOREIGN KEY ("allergy_id") REFERENCES "allergies"("allergy_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_contact_user_id_fkey" FOREIGN KEY ("contact_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_phones" ADD CONSTRAINT "contact_phones_emergency_id_fkey" FOREIGN KEY ("emergency_id") REFERENCES "emergency_contacts"("emergency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_emails" ADD CONSTRAINT "contact_emails_emergency_id_fkey" FOREIGN KEY ("emergency_id") REFERENCES "emergency_contacts"("emergency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_records" ADD CONSTRAINT "weekly_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
