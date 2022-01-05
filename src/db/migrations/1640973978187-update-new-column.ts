import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateNewColumn1640973978187 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "User"
         ADD COLUMN "refreshToken" VARCHAR(250) NOT NULL DEFAULT('111')`);
    await queryRunner.query(
      ` ALTER TABLE "User"
         ADD COLUMN "refreshTokenExpired" DATE NOT NULL DEFAULT CURRENT_DATE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('User', 'refreshToken');
    await queryRunner.dropColumn('User', 'refreshTokenExpired');
  }
}
