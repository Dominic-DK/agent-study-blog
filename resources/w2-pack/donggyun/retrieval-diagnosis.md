# 검색 실패 진단 — 특정 문서의 내용을 못 가져올 때

위에서부터 순서대로 확인합니다. 앞 단계가 틀렸으면 뒤 단계를 고쳐도 소용없습니다.
SQL의 테이블 · 열 이름(`chunks`, `doc_name`, `page`, `content`, `embedding`)은 예시입니다. 본인 스키마에 맞게 바꾸세요.

## 1. 그 문서가 인덱스에 들어 있나

```sql
SELECT doc_name, count(*) AS chunks
FROM chunks
GROUP BY doc_name
ORDER BY chunks DESC;
```

- 문서가 목록에 없다 → 인제스트에서 빠짐. 파싱 로그 확인
- 다른 문서보다 청크가 눈에 띄게 적다 → 일부만 파싱됨 (표 · 스캔 PDF · 다단 편집)
- 한 문서가 전체의 절반을 넘는다 → 4번에서 다시 봄

## 2. 청크가 자기 문서를 알고 있나

```sql
SELECT doc_name, page, left(content, 120)
FROM chunks
WHERE doc_name = '찾으려던 문서'
LIMIT 5;
```

- `doc_name` · `page` 열이 없거나 비어 있다 → 메타데이터부터 채우기
- 열은 있는데 본문에는 문서 이름이 없다 → 임베딩은 본문만 보므로, 본문 앞에 `[문서명 · 장 · 쪽]`을 붙여 다시 임베딩하는 것을 검토

## 3. 질문이 문서를 지목하나

「○○ 계획에서 △△는?」처럼 문서 이름이 질문에 들어 있는지 봅니다. 벡터 검색은 뜻이 비슷한 문장을 찾지, 이름을 정확히 맞추지 않습니다.

문서를 먼저 거르고 그 안에서 검색:

```sql
SELECT doc_name, page, left(content, 120)
FROM chunks
WHERE doc_name = '○○ 계획'
ORDER BY embedding <=> $1      -- $1: 질문 임베딩. <=> 는 코사인 거리
LIMIT 5;
```

키워드가 본문에 있는지부터 확인:

```sql
SELECT doc_name, page, left(content, 120)
FROM chunks
WHERE content ILIKE '%도시광업%'
LIMIT 10;
```

- 키워드로는 나오는데 벡터 검색으로는 안 나온다 → 키워드 검색과 벡터 검색을 같이 쓰는 방식을 검토
- 문서를 한국어로 번역해서 넣었다면, PostgreSQL 기본 전문 검색 설정은 한국어를 형태소 단위로 나누지 않습니다. 처음에는 `ILIKE`나 `pg_trgm`으로 확인하는 편이 간단합니다

## 4. 상위 결과가 한두 문서에 쏠리나

```sql
SELECT doc_name, count(*)
FROM (
  SELECT doc_name
  FROM chunks
  ORDER BY embedding <=> $1
  LIMIT 10
) t
GROUP BY doc_name
ORDER BY 2 DESC;
```

- 상위 10개가 한 문서에서만 나온다 → 문서당 개수 제한, 또는 넉넉히 뽑은 뒤 다시 순위 매기기
- 여러 문서를 종합하는 질문(심화형)은 여기서 주로 막힙니다

## 기록

| 날짜 | 질문 # | 걸린 단계 (1~4) | 근거 | 바꿀 것 한 가지 |
|---|---|---|---|---|
| | | | | |

원인을 찾았으면 **한 가지만** 바꾸고 `eval-sheet.md`로 다시 잽니다.
