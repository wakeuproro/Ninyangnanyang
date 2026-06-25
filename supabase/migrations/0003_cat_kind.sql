-- 니냥(길에서 발견, 랜덤이름) / 내냥(내 반려묘, 직접 작명) 구분
create type cat_kind as enum ('ninyang', 'naenyang');

alter table cat_cards
  add column kind cat_kind not null default 'ninyang';
