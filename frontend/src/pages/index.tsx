import SecretSantaForm from "@/components/SecretSantaForm";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
      {/* Blurred blue gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-60 filter blur-3xl"></div>
      </div>
      <SecretSantaForm />
    </div>
  );
}
