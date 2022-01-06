import {MigrationInterface, QueryRunner} from "typeorm";

export class testFKTokenUser1641460285851 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Token"
            ADD COLUMN "userId" integer
        `)

        await queryRunner.query(`
            ALTER TABLE "Token"
            ADD CONSTRAINT "FK_Token_UserId" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Token"
            DROP CONSTRAINT "FK_Token_UserId"
        `)
    }

}
