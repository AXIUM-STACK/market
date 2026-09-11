import PublicLayout from "./(public)/layout";
import PublicPage, { metadata } from "./(public)/page";

export { metadata };

export default async function Page() {
  return (
    <PublicLayout>
      <PublicPage />
    </PublicLayout>
  );
}