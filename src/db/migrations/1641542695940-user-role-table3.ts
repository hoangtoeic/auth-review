import {MigrationInterface, QueryRunner} from "typeorm";

export class userRoleTable31641542695940 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE "UserRole"(
        "id" SERIAL NOT NULL,
        "userId" integer ,
        "roleId" integer,
        CONSTRAINT "PK_UserRole_id" PRIMARY KEY("id")
        )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE "UserRole"`)
    }

}
