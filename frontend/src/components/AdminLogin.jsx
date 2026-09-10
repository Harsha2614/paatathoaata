import React, { useState } from "react";
import { adminLogin } from "../api";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const user = await adminLogin(email, password);

      onLogin(user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#08080d] px-5 py-10 text-white">

      <div className="w-full max-w-[430px] rounded-[22px] border border-white/[0.09] bg-white/[0.045] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.4)] max-[500px]:p-6">

        {/* Header */}

        <div className="mb-8">
          <p className="mb-3 font-['DM_Sans'] text-[11px] font-bold uppercase tracking-[0.14em] text-[#a78bfa]">
            GuessTheSong
          </p>

          <h1 className="m-0 font-['Space_Grotesk'] text-[36px] font-bold tracking-[-0.045em] text-white">
            Admin Login
          </h1>

          <p className="mt-2 text-[14px] leading-6 text-[#a4a4b2]">
            Manage songs and daily games
          </p>
        </div>


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          {/* Email */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="admin-email"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              className="min-h-[52px] w-full rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-[#5f5f6b] hover:border-white/[0.15] focus:border-[#8b5cf6] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#8b5cf6]/10"
            />
          </div>


          {/* Password */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="admin-password"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4a4b2]"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              className="min-h-[52px] w-full rounded-[12px] border border-white/[0.09] bg-white/[0.045] px-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-[#5f5f6b] hover:border-white/[0.15] focus:border-[#8b5cf6] focus:bg-white/[0.06] focus:ring-4 focus:ring-[#8b5cf6]/10"
            />
          </div>


          {/* Error */}

          {error && (
            <div className="rounded-[10px] border border-red-400/20 bg-red-400/[0.07] px-3.5 py-3 text-[13px] leading-5 text-red-300">
              {error}
            </div>
          )}


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 min-h-[52px] w-full rounded-[12px] border-0 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;