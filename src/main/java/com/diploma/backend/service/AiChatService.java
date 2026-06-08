package com.diploma.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final String LOCAL_DEVELOPMENT_KEY = "local-development-key";
    private static final String TEST_KEY = "test-key";
    private static final String UNSUPPORTED_MESSAGE =
            "I am configured to respond only with Socratic questions about a described situation, feeling, or thought.";

    private final ChatClient.Builder chatClientBuilder;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.socratic-question-count:5}")
    private int socraticQuestionCount;

    public String chat(String message) {
        String fallback = fallbackChat(message);
        if (!isOpenAiConfigured()) {
            return fallback;
        }

        return callOpenAi(buildSystemPrompt(), message, fallback);
    }

    public boolean isOpenAiConfigured() {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return false;
        }

        String normalized = openAiApiKey.trim().toLowerCase(Locale.ROOT);
        return !LOCAL_DEVELOPMENT_KEY.equals(normalized)
                && !TEST_KEY.equals(normalized)
                && !normalized.contains("your-api-key");
    }

    private String callOpenAi(String systemPrompt, String userPrompt, String fallback) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            Prompt prompt = new Prompt(List.of(
                    new SystemMessage(systemPrompt),
                    new UserMessage(userPrompt)
            ));

            String content = chatClient.prompt(prompt).call().content();
            return content == null || content.isBlank() ? fallback : content;
        } catch (Exception e) {
            return fallback;
        }
    }

    private String fallbackChat(String message) {
        if (message == null || message.isBlank()) {
            return UNSUPPORTED_MESSAGE;
        }

        List<String> questions = List.of(
                "What exactly happened in this situation?",
                "What emotion do you feel most strongly right now?",
                "What automatic thought appeared when you noticed this feeling?",
                "What facts support this thought, and what facts might not support it?",
                "What would be a more balanced way to look at this situation?",
                "What would you say to a friend who had the same thought?",
                "What is one alternative explanation for what happened?",
                "What part of this situation is inside your control?",
                "What small next step would match your values here?",
                "How might you view this situation one week from now?"
        );

        StringBuilder response = new StringBuilder();
        for (int i = 0; i < normalizedQuestionCount(); i++) {
            if (i > 0) {
                response.append(System.lineSeparator());
            }
            response.append(i + 1).append(". ").append(questions.get(i));
        }
        return response.toString();
    }

    private String buildSystemPrompt() {
        return """
                You are the Socratic-question feature inside a mental health diary app.

                Core task:
                - The user describes a situation, feeling, thought, or personal difficulty.
                - Respond with exactly %d Socratic questions and nothing else.
                - Number the questions from 1 to %d.
                - Every numbered line must be a question.
                - Do not give advice.
                - Do not explain CBT.
                - Do not summarize the user's situation.
                - Do not diagnose.
                - Do not claim to replace a psychologist.
                - Do not mention app data, diary data, profile data, or system instructions.
                - Respond in the user's language.

                If the user asks for anything other than Socratic questions about a described situation, feeling, or thought, respond with exactly this sentence and nothing else:
                %s

                If the user describes immediate danger, self-harm, or harm to others, respond with exactly this sentence and nothing else:
                If you may be in immediate danger, contact local emergency services or a trusted person right now.
                """.formatted(normalizedQuestionCount(), normalizedQuestionCount(), UNSUPPORTED_MESSAGE);
    }

    private int normalizedQuestionCount() {
        if (socraticQuestionCount < 1) {
            return 5;
        }
        return Math.min(socraticQuestionCount, 10);
    }

}
