import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #14532d 0%, #111827 100%)',
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(45,80,22,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(127,176,105,0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(127,176,105,1) 1px, transparent 1px), linear-gradient(90deg, rgba(127,176,105,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  )
}
