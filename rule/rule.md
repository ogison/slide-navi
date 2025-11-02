# Next.js プロジェクト開発規約

## 📁 プロジェクト構造

### ルートディレクトリ構成

```
slide-navi/
├── src/                    # アプリケーションソースコード
│   ├── app/               # App Router（ルーティング）
│   ├── components/        # 共通コンポーネント
│   ├── features/          # 機能別モジュール
│   ├── hooks/             # カスタムフック
│   ├── lib/               # ライブラリ関連コード
│   ├── utils/             # ユーティリティ関数
│   ├── types/             # TypeScript型定義
│   ├── styles/            # グローバルスタイル
│   └── constants/         # 定数定義
├── public/                # 静的ファイル
├── doc/                   # プロジェクトドキュメント
├── rule/                  # 開発規約・ルール
├── tests/                 # テストファイル
└── [設定ファイル群]
```

### App Router構造

```
src/app/
├── layout.tsx             # ルートレイアウト
├── page.tsx               # ホームページ
├── globals.css            # グローバルCSS
├── (auth)/               # 認証グループ（URLに含まれない）
│   ├── login/
│   └── register/
├── dashboard/            # ダッシュボード
│   ├── layout.tsx
│   └── page.tsx
├── api/                  # APIルート
└── _components/          # app専用プライベートコンポーネント
```

## 📝 命名規則

### ファイル・フォルダ命名規則

| 種類                         | 命名規則               | 例                      |
| ---------------------------- | ---------------------- | ----------------------- |
| **appディレクトリ内**        | kebab-case             | `user-profile/page.tsx` |
| **componentsディレクトリ内** | PascalCase             | `UserProfile.tsx`       |
| **hooksディレクトリ内**      | camelCase + use prefix | `useAuth.ts`            |
| **utilsディレクトリ内**      | camelCase              | `formatDate.ts`         |
| **型定義ファイル**           | PascalCase             | `User.types.ts`         |
| **定数ファイル**             | kebab-case             | `api-config.ts`         |

### コード内命名規則

#### React コンポーネント

```typescript
// ✅ 良い例
export const UserProfile = () => { ... }

// ❌ 悪い例
export const userProfile = () => { ... }
```

#### カスタムフック

```typescript
// ✅ 良い例
export const useUserData = () => { ... }
export const useFetchPosts = () => { ... }

// ❌ 悪い例
export const getUserData = () => { ... }  // useで始まらない
export const UseUserData = () => { ... }  // PascalCase
```

#### ユーティリティ関数

```typescript
// ✅ 良い例
export const formatDate = (date: Date) => { ... }
export const isValidEmail = (email: string) => { ... }
export const hasPermission = (user: User) => { ... }

// プレフィックス規則
// - get: データ取得
// - set: データ設定
// - is: boolean判定
// - has: 存在確認
// - should: 条件判定
```

#### TypeScript 型定義

```typescript
// インターフェース（PascalCase）
interface User {
  id: string;
  name: string;
}

// 型エイリアス（PascalCase）
type UserRole = "admin" | "user" | "guest";

// Props型（PascalCase + Propsサフィックス）
interface UserProfileProps {
  user: User;
  onEdit: () => void;
}
```

#### 定数・Enum

```typescript
// 定数（UPPER_SNAKE_CASE）
export const API_BASE_URL = "https://api.example.com";
export const MAX_RETRY_COUNT = 3;

// Enum（PascalCase / 値はUPPER_SNAKE_CASE）
enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}
```

## 🏗️ コンポーネント構成

### コンポーネント分類

#### 1. UIコンポーネント（components/ui/）

- 汎用的な表示専用コンポーネント
- ビジネスロジックを含まない
- 例：Button, Card, Modal, Input

#### 2. 機能コンポーネント（features/）

- 特定の機能に紐づくコンポーネント
- ビジネスロジックを含む
- フォルダで機能単位にグループ化

```
features/
├── pdf-viewer/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── index.ts
└── slide-navigation/
    ├── components/
    ├── hooks/
    └── index.ts
```

#### 3. レイアウトコンポーネント（components/layout/）

- ページレイアウト用コンポーネント
- Header, Footer, Sidebar など

### コンポーネントファイル構成

```typescript
// UserProfile.tsx
import { FC } from 'react';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  user: User;
  onEdit: () => void;
}

export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  // フック
  // 状態
  // ハンドラー
  // レンダリング
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

## 🎨 スタイリング規則

### CSS Modules使用時

- ファイル名: `ComponentName.module.css`
- クラス名: camelCase（`styles.userProfile`）

### Tailwind CSS使用時

- コンポーネント内で直接クラス指定
- カスタムクラスは`@apply`で定義

### SASS/SCSS使用時

- ファイル名: `ComponentName.module.scss`
- 変数・ミックスイン: `src/styles/_variables.scss`

## ⚡ パフォーマンス最適化

### 必須実装事項

1. **画像最適化**
   - Next.js Imageコンポーネントの使用
   - 適切なサイズとフォーマット指定

2. **コード分割**
   - 動的インポート活用
   - ルートグループによる分離

3. **メモ化**
   - `React.memo`の適切な使用
   - `useMemo`, `useCallback`の活用

4. **バンドルサイズ管理**
   - 不要な依存関係の削除
   - Tree Shakingの活用

## 🔒 セキュリティ規則

### 絶対禁止事項

- APIキー、シークレットのハードコーディング
- 機密情報のコミット
- ユーザー入力の未検証使用

### 必須対策

- 環境変数による秘匿情報管理
- 入力値検証とサニタイジング
- CSRFトークンの実装

## 📊 状態管理

### ローカル状態

- `useState`の使用
- 単一コンポーネント内で完結する状態

### グローバル状態

- Context APIまたは状態管理ライブラリ使用
- 複数コンポーネント間で共有する状態

### サーバー状態

- React Query / SWR等の使用を推奨
- キャッシュ管理の実装

## 🧪 テスト規約

### テストファイル配置

```
src/
├── components/
│   └── UserProfile/
│       ├── UserProfile.tsx
│       └── UserProfile.test.tsx
```

### テスト命名

- ファイル名: `ComponentName.test.tsx`
- テストケース: 日本語での記述も可

## 📌 ベストプラクティス

### DO（推奨事項）

- ✅ 一貫性のある命名規則の遵守
- ✅ 機能単位でのファイル整理
- ✅ TypeScriptの厳格な型定義
- ✅ エラーハンドリングの実装
- ✅ アクセシビリティへの配慮

### DON'T（避けるべき事項）

- ❌ appディレクトリへの全コード配置
- ❌ 200+ファイルの単一フォルダ配置
- ❌ 7階層以上のディレクトリネスト
- ❌ 2000行を超える単一ファイル
- ❌ any型の濫用

## 🔄 Git コミット規約

### コミットメッセージ形式

```
<type>: <description>

[optional body]
```

### Type一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスや補助ツール変更

## 📚 参考リソース

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)

---

最終更新日: 2025年1月20日
バージョン: 1.0.0
