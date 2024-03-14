describe("db-env", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("should set environment variables for database connection", () => {
    // Arrange
    process.env["fint.database.url"] = "jdbc:postgresql://localhost:5432/test";
    process.env["fint.database.username"] = "username";
    process.env["fint.database.password"] = "password";
    // Act
    require("./db-env");
    // Assert
    expect(process.env.DATABASE_PORT).toBe("5432");
    expect(process.env.DATABASE_HOST).toBe("localhost");
    expect(process.env.DATABASE_USERNAME).toBe("username");
    expect(process.env.DATABASE_PASSWORD).toBe("password");
    expect(process.env.DATABASE_NAME).toBe("test");
    expect(process.env.DATABASE_SCHEMA).toBe("username");
  });

  it("should not override existing environment variables", () => {
    // Arrange
    process.env["fint.database.url"] = "jdbc:postgresql://localhost:5432/test";
    process.env["fint.database.username"] = "username";
    process.env["fint.database.password"] = "password";
    process.env.DATABASE_PORT = "5433";
    process.env.DATABASE_HOST = "otherhost";
    process.env.DATABASE_USERNAME = "otherusername";
    process.env.DATABASE_PASSWORD = "otherpassword";
    process.env.DATABASE_NAME = "othername";
    process.env.DATABASE_SCHEMA = "otherschema";
    // Act
    require("./db-env");
    // Assert
    expect(process.env.DATABASE_PORT).toBe("5433");
    expect(process.env.DATABASE_HOST).toBe("otherhost");
    expect(process.env.DATABASE_USERNAME).toBe("otherusername");
    expect(process.env.DATABASE_PASSWORD).toBe("otherpassword");
    expect(process.env.DATABASE_NAME).toBe("othername");
    expect(process.env.DATABASE_SCHEMA).toBe("otherschema");
  });

  it("should not set environment variables if JDBC URL is not set", () => {
    // Arrange
    process.env["fint.database.url"] = "";
    process.env["fint.database.username"] = "";
    process.env["fint.database.password"] = "";
    // Act
    require("./db-env");

    // Assert
    expect(process.env.DATABASE_PORT).toBeUndefined();
    expect(process.env.DATABASE_HOST).toBeUndefined();
    expect(process.env.DATABASE_USERNAME).toBeUndefined();
    expect(process.env.DATABASE_PASSWORD).toBeUndefined();
    expect(process.env.DATABASE_NAME).toBeUndefined();
    expect(process.env.DATABASE_SCHEMA).toBeUndefined();
  });
});
