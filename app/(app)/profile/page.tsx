export default function ProfilePage() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>
      <form action="/auth/signout" method="POST">
        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-xl">
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
