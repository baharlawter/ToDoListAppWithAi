package com.daylight.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.datasource.hikari.maximum-pool-size=1"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TodoTaskRepositoryTest {
    @Autowired
    private TodoTaskRepository tasks;

    @Test
    void persistsTasksInSqlite() {
        TodoTask saved = tasks.saveAndFlush(new TodoTask("SQLite persistence"));

        assertNotNull(saved.getId());
        assertEquals("SQLite persistence", tasks.findById(saved.getId()).orElseThrow().getTitle());
    }
}
