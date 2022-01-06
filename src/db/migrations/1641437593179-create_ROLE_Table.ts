import {MigrationInterface, QueryRunner} from "typeorm";

export class createROLETable1641437593179 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TYPE "ROLE" AS ENUM('USER', 'ADMIN','SUPERADMIN')
        `)
       
        await queryRunner.query(`
         CREATE TABLE "Role" (
             "id" SERIAL NOT NULL,
              "name" "ROLE" NOT NULL,
              CONSTRAINT "PK_ROLE_ID" PRIMARY KEY ("id")
    )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("Role")
    await queryRunner.query(`
    DROP TYPE "ROLE"`)
    }

}
