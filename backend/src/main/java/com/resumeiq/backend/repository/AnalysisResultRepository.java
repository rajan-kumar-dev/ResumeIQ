package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.AnalysisResult;
import com.resumeiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    List<AnalysisResult> findByUserOrderByCreatedAtDesc(User user);
}
