import {MigrationInterface, QueryRunner} from "typeorm";

export class newROLETable1641428520318 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("User", "roleName");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            ` ALTER TABLE "User"
                ADD COLUMN "roleName"  "ROLE" NOT NULL`,
          );
    }

}
