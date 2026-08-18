<%= ENV["PR_TITLE"] %>

## 確認事項
- [ ] [staging環境](https://staging.ojoxux.com) での動作チェック

## 変更内容
<% pull_requests.each do |pr| -%>
- #<%= pr.number %><%= pr.mention %>
<% end -%>
