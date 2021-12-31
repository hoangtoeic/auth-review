import {MigrationInterface, QueryRunner} from "typeorm";

export class test1640923170947 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TYPE "ROLE" AS ENUM('USER', 'ADMIN','SUPERADMIN')
        `)
       
        await queryRunner.query(`
        CREATE TABLE "User" (
            "id" SERIAL NOT NULL,
            "email" character varying NOT NULL,
            "firstName" character varying NOT NULL,
            "lastName" character varying NOT NULL,
            "password" character varying NOT NULL,
            "roleName" "ROLE" NOT NULL,
            CONSTRAINT "PK_USER_ID" PRIMARY KEY ("id")
        )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TYPE "ROLE",
        DROP TABLE "User"
        `)
    }

}
