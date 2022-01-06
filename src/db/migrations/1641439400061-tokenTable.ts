import {MigrationInterface, QueryRunner} from "typeorm";

export class tokenTable1641439400061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "Token" (
        "id" SERIAL NOT NULL,
        "refreshToken" character varying,
        "refreshTokenExpired" character varying,
        "resetToken" character varying,
        "resetTokenExpired" character varying
    )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("Token")
    }

}
