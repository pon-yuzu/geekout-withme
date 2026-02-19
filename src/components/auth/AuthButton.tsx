export default function AuthButton() {
  return (
    <div className="flex items-center gap-3">
      <a
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
      >
        Log in
      </a>
      <a
        href="/signup"
        className="text-sm font-medium px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
      >
        Sign up
      </a>
    </div>
  );
}
