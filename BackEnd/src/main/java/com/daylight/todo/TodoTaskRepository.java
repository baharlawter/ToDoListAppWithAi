package com.daylight.todo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface TodoTaskRepository extends JpaRepository<TodoTask, Long> {
    List<TodoTask> findAllByOrderByCreatedAtDesc();

    @Transactional
    void deleteByCompletedTrue();
}
