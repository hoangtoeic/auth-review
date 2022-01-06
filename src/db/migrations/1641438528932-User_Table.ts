import {MigrationInterface, QueryRunner} from "typeorm";

export class UserTable1641438528932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE "User"
        `)
        await queryRunner.query(`
        CREATE TABLE "User" (
            "id" SERIAL NOT NULL,
            "email" character varying NOT NULL,
            "firstName" character varying NOT NULL,
            "lastName" character varying NOT NULL,
            "password" character varying NOT NULL,
            CONSTRAINT "PK_USER_ID" PRIMARY KEY ("id")
        )
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE "User"
        `)
    }

}
