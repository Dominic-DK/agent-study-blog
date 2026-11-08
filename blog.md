---
title: 블로그
nav_order: 2
---

# 📝 블로그

진행 로그 · 배운 것 · 시행착오 · 공유하고 싶은 링크를 자유롭게 남기는 곳입니다.

[📝 새 글 쓰기](https://github.com/Dominic-DK/agent-study-blog/new/main/_posts?filename=2026-11-09-my-log.md&value=---%0Atitle%3A%20%EC%A0%9C%EB%AA%A9%EC%9D%84%20%EC%A0%81%EC%96%B4%EC%A3%BC%EC%84%B8%EC%9A%94%0Aauthor%3A%20%EC%9D%B4%EB%A6%84%0A---%0A%0A%EC%97%AC%EA%B8%B0%EC%97%90%20%EB%82%B4%EC%9A%A9%EC%9D%84%20%EC%A0%81%EC%96%B4%EC%A3%BC%EC%84%B8%EC%9A%94.%0A){: .btn .btn-primary target="_blank" }

파일 이름 앞의 날짜(`2026-11-09`)를 오늘 날짜로, 뒤의 `my-log`를 영어 제목으로 바꿔서 저장하세요. 자세한 방법은 [도움말](how-to-edit.md).

---

{% if site.posts.size == 0 %}
아직 글이 없어요. 첫 글을 써보세요!
{% else %}
{% for post in site.posts %}
- **[{{ post.title }}]({{ post.url | relative_url }})** — {{ post.date | date: "%Y-%m-%d" }}{% if post.author %} · {{ post.author }}{% endif %}
{% endfor %}
{% endif %}
