/*CREACIÓN BASE DE DATOS DE FRACCIONAMIENTO*/

create database fraccionamiento

/*prueba push*/
/* base de datos rols*/
create table rols(
  id smallserial NOT NULL,
  rol varchar(20) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

/* base de datos types */
create table types(
  id smallserial NOT NULL,
  type varchar(20) NOT NULL UNIQUE,
  PRIMARY KEY(id)
);

/* create table status_groups*/
create table status_groups(
  id smallserial NOT NULL,
  status_group varchar(50) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);


/* create table status_groups*/
create table status_fractions(
  id smallserial NOT NULL,
  status_fractions varchar(50) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

/* create table plants*/
create table plants(
  id smallserial NOT NULL,
  plant varchar(50) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

/* create table semi_elaborates*/
create table semi_elaborates(
  id smallserial NOT NULL, 
  codigo varchar(60) NOT NULL UNIQUE,
  name varchar(60),
  ton_batch int NOT NULL,
  description varchar(255),
  PRIMARY KEY (id)
);

/* base de datos usuarios*/
create table users(
  id serial NOT NULL,
  username varchar(30) NOT NULL,
  lastname varchar(30) NOT NULL,
  docket int NOT NULL UNIQUE,
  password varchar(60) NOT NULL,
  rol_id smallint NOT NULL,
  enable boolean NOT NULL,
  email varchar(50) UNIQUE,
  PRIMARY KEY (id),
  FOREIGN KEY(rol_id) REFERENCES rols (id) /*relación de usuario con rols*/
);

/* base de datos Tokens*/
create table tokens(
  id serial NOT NULL,   
  user_id int NOT NULL,
  token varchar(255),
  type varchar(80),
  is_revoked boolean,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

/*base de datos Material*/
create table materials(
  id serial NOT NULL UNIQUE,
  description varchar(100) NOT NULL,
  tolerance real NOT NULL,
  version real NOT NULL,
  type_id smallint NOT NULL,
  epp int NOT NULL,
  img varchar(30),
  PRIMARY KEY (id),
  FOREIGN key(type_id) REFERENCES types (id)
);

/* base de datos old_producto*/
create table old_materials(
  id serial NOT NULL,
  material_id serial NOT NULL,
  description varchar(100) NOT NULL,
  tolerance real NOT NULL,
  version real NOT NULL,
  img varchar(30),
  justification varchar(255) NOT NULL,
  user_id int NOT NULL,
  type_id smallint NOT NULL,
  epp int NOT NULL,
  PRIMARY KEY (id , material_id),
  FOREIGN KEY (material_id) REFERENCES materials (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN key(type_id) REFERENCES types (id)
);

/* base de datos VOUCHERS */
create table vouchers(
  id uuid DEFAULT uuid_generate_v4(),
  sap varchar(30) NOT NULL,
  expiration_date timestamp NOT NULL,
  quantity real NOT NULL,
  user_id int NOT NULL,
  material_id int NOT NULL,
  manufacturing_date timestamp ,
  lot_id int NOT NULL,
  admission_date timestamp NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (material_id) REFERENCES materials (id),
  FOREIGN KEY (lot_id) REFERENCES lots (id)
);

/* create table groups*/
create table groups(
  id uuid DEFAULT uuid_generate_v4(),
  name int NOT NULL,
  status_group_id smallint NOT NULL,
  plant_id smallint NOT NULL,
  semiELaborate_codigo int,
  ton_batch real,
  create_date timestamp NOT NULL,
  update_date timestamp,
  entry_group_date timestamp,
  PRIMARY KEY (id),
  FOREIGN KEY (status_group_id) REFERENCES status_groups (id),
  FOREIGN KEY (plant_id) REFERENCES plants (id),
);

/*create tabla group_materials*/
create table group_materials(
  id uuid DEFAULT uuid_generate_v4(), 
  groups_id uuid NOT NULL,
  material_id int NOT NULL,
  quantity real NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (groups_id) REFERENCES groups (id),
  FOREIGN KEY (material_id) REFERENCES materials (id)
);

/* create table fractions*/
create table fractions(
  id uuid DEFAULT uuid_generate_v4(), 
  quantity real NOT NULL,
   material_id int NOT NULL,
  create_date timestamp NOT NULL,
  user_id int NOT NULL,
  status_fractions_id smallint NOT NULL,
  groups_id uuid ,
  fraction_number int NOT NULL,
  groups_materials_id uuid,
  lot_id int NOT NUll,
  PRIMARY KEY (id),
  FOREIGN KEY (groups_materials_id) REFERENCES group_materials (id),
  FOREIGN KEY (status_fractions_id) REFERENCES status_fractions (id),
  FOREIGN KEY (lot_id) REFERENCES lots (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (groups_id) REFERENCES groups (id),
  FOREIGN KEY (material_id) REFERENCES materials (id)
);

/* create table lots*/
create table lots(
  id int NOT NULL,
  material_id int NOT NULL,
  quantity real NOT NULL,
  quantity_act real NOT NULL,
  expiration_date timestamp NOT NULL,
  PRIMARY KEY (id , material_id),
  FOREIGN KEY (material_id) REFERENCES materials (id)
);

/* base de datos  rejected_fractions*/
create table rejected_fractions(
  id uuid DEFAULT uuid_generate_v4(),
  fraction_id uuid NOT NULL,
  rejected_date timestamp NOT NULL,
  justification varchar(255) NOT NULL,
  user_id int NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (fraction_id) REFERENCES fractions (id)
);

/* create table alarms*/
create table alarms(
  id uuid DEFAULT uuid_generate_v4(),
  type int NOT NULL,
  create_date timestamp NOT NULL,
  message varchar(255) NOT NULL,
  ack_date timestamp, 
  user_id int NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

/* create table semi_elavorate_materials*/
create table semi_elaborate_materials(
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  material_id int NOT NULL,
  semi_elaborate_id smallint NOT NULL,
  quantity real NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (material_id) REFERENCES materials (id),
  FOREIGN KEY (semi_elaborate_id) REFERENCES semi_elaborates (id)
)
