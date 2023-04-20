# ベースイメージとして公式のNode.jsイメージを使用
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージのインストール
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ソースコードのコピー
COPY . .

# Next.jsアプリケーションのビルド
RUN yarn build

# ビルド後に使用するポートを開放
EXPOSE 3000

# Next.jsアプリケーションを実行
CMD ["yarn", "start"]
