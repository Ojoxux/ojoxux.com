<%= ENV["PR_TITLE"] %>

## 変更内容
[staging環境](https://staging.ojoxux.com) で以下の動作確認をすること

<% pull_requests.each do |pr| -%>
<%= pr.to_checklist_item %>
<% end -%>
