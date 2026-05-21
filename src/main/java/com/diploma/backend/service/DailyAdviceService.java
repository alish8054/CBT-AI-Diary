package com.diploma.backend.service;

import com.diploma.backend.Entity.DiaryEntry;
import com.diploma.backend.Entity.MoodEntry;
import com.diploma.backend.repository.DiaryEntryRepository;
import com.diploma.backend.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyAdviceService {

    private final ChatClient.Builder chatClientBuilder;
    private final DiaryEntryRepository diaryRepository;
    private final MoodEntryRepository moodRepository;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiApiKey;

    public Map<String, Object> generateDailyAdvice(Long userId) {
        List<DiaryEntry> recentDiaries = diaryRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(5)
                .toList();
        List<MoodEntry> recentMoods = moodRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .limit(7)
                .toList();

        String todayMood = moodRepository.findByUserIdAndDate(userId, LocalDate.now())
                .map(MoodEntry::getMood)
                .orElse("");

        String diaryContext = recentDiaries.stream()
                .map(entry -> "[" + entry.getCreatedAt() + "] " + entry.getText())
                .collect(Collectors.joining("\n"));
        String moodContext = recentMoods.stream()
                .map(entry -> "[" + entry.getDate() + "] " + entry.getMood())
                .collect(Collectors.joining("\n"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("todayMood", todayMood);
        result.put("diaryCount", recentDiaries.size());
        result.put("moodCount", recentMoods.size());

        if (recentDiaries.isEmpty() && recentMoods.isEmpty()) {
            result.put("source", "local");
            result.put("advice", "Add today's mood and diary entry first. Then this section can give more personal advice.");
            result.put("tasks", List.of(
                    "Choose your mood for today.",
                    "Write one honest diary entry.",
                    "Come back here for a daily reflection."
            ));
            return result;
        }

        if (isLocalAiMode()) {
            result.put("source", "local");
            result.put("advice", buildLocalAdvice(todayMood, recentDiaries));
            result.put("tasks", buildLocalTasks(todayMood, recentDiaries));
            return result;
        }

        result.put("source", "ai");
        result.put("advice", callAi(todayMood, moodContext, diaryContext));
        result.put("tasks", List.of());
        return result;
    }

    private boolean isLocalAiMode() {
        return openAiApiKey == null || openAiApiKey.isBlank() || "local-development-key".equals(openAiApiKey);
    }

    private String buildLocalAdvice(String todayMood, List<DiaryEntry> recentDiaries) {
        String moodPart = todayMood == null || todayMood.isBlank()
                ? "No mood was selected today."
                : "Today's mood is: " + todayMood + ".";
        String diaryPart = recentDiaries.isEmpty()
                ? "There is no diary entry yet."
                : "You wrote a diary entry, so use it as a signal for what needs attention today.";

        return moodPart + " " + diaryPart + " Take one small action today instead of trying to solve everything at once.";
    }

    private List<String> buildLocalTasks(String todayMood, List<DiaryEntry> recentDiaries) {
        if (todayMood != null && todayMood.toLowerCase().contains("happy")) {
            return List.of(
                    "Write down one thing that helped your mood today.",
                    "Share a short positive message with someone.",
                    "Protect 20 minutes for rest or a pleasant activity."
            );
        }

        return List.of(
                "Write one thought that is bothering you and one kinder alternative thought.",
                "Do a 5-minute breathing pause.",
                "Choose one small useful action you can finish today."
        );
    }

    private String callAi(String todayMood, String moodContext, String diaryContext) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage("""
                            You are a supportive CBT diary assistant. Give careful, non-clinical daily guidance.
                            Do not diagnose. Do not claim certainty. Keep the response practical.
                            Format the response with two sections: Advice and Tasks for today.
                            """),
                    new UserMessage(String.format("""
                            Today's mood: %s

                            Recent mood history:
                            %s

                            Recent diary entries:
                            %s
                            """, todayMood, moodContext, diaryContext))
            ));

            return chatClient.prompt(prompt).call().content();
        } catch (Exception e) {
            return "AI advice could not be generated: " + e.getMessage();
        }
    }
}
