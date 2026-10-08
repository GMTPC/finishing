-- ลบตารางรุ่นเก่าที่ถูกสร้างด้วย raw SQL จาก server/utils/db.ts (ไฟล์นั้นถูกลบไปแล้ว)
--
-- ทำไมต้องมีไฟล์นี้:
-- ตารางเดิมถูกสร้างด้วย `created_at DATETIME DEFAULT GETDATE()` โดยไม่ตั้งชื่อ constraint
-- SQL Server จึงตั้งชื่อให้เองเป็น DF__work_reco__creat__XXXXXXXX พอ `prisma db push`
-- จะแก้คอลัมน์ก็ติด error: The object 'DF__work_reco__creat__...' is dependent on column 'created_at'
--
-- วิธีใช้:
--   npx prisma db execute --schema prisma/schema.prisma --file prisma/sql/drop-legacy-tables.sql
--   npm run db:push
--
-- ความปลอดภัย: ดรอปเฉพาะตารางที่ "ไม่มีข้อมูลเลย" เท่านั้น
-- ถ้าตารางไหนมีแถวอยู่ จะถูกข้ามไปและขึ้นข้อความเตือน ต้องทำ migration ย้ายข้อมูลเอง

DECLARE @table SYSNAME, @rows INT, @sql NVARCHAR(MAX);

DECLARE legacy CURSOR LOCAL FAST_FORWARD FOR
  SELECT name FROM (VALUES ('work_records'), ('tag_receives'), ('shift_closes')) AS t(name);

OPEN legacy;
FETCH NEXT FROM legacy INTO @table;

WHILE @@FETCH_STATUS = 0
BEGIN
  IF OBJECT_ID(@table, 'U') IS NOT NULL
  BEGIN
    SET @sql = N'SELECT @cnt = COUNT(*) FROM ' + QUOTENAME(@table);
    EXEC sp_executesql @sql, N'@cnt INT OUTPUT', @cnt = @rows OUTPUT;

    IF @rows = 0
    BEGIN
      SET @sql = N'DROP TABLE ' + QUOTENAME(@table);
      EXEC sp_executesql @sql;
      PRINT 'dropped empty legacy table: ' + @table;
    END
    ELSE
      PRINT 'SKIPPED (has ' + CAST(@rows AS NVARCHAR(20)) + ' rows): ' + @table;
  END

  FETCH NEXT FROM legacy INTO @table;
END

CLOSE legacy;
DEALLOCATE legacy;
