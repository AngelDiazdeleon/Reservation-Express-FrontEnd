import React from "react";
import './page/css/home.css';
const Home: React.FC = () => {
  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary min-h-screen">
      <div className="relative flex flex-col min-h-screen overflow-x-hidden">
        {/* HEADER */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-border-light dark:border-border-dark px-4 py-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-50">
          <div className="flex items-center gap-4">
            <div className="text-primary size-7">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold">TerrazaApp</h2>
          </div>

          <div className="hidden md:flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-sm font-medium hover:text-primary" href="#">
                Explorar
              </a>
              <a className="text-sm font-medium hover:text-primary" href="#">
                Publicar mi terraza
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center rounded-full h-10 w-10 bg-background-light dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div
                className="bg-center bg-cover rounded-full size-10"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEZcII-tQ5nd0pAbeAST_qqGzjtDtS4J7Z9Iqe_ik8niuYGn-OJRq1VCs2VZajlhMHF6Ath2O9KDNO-2-bR01NukbMhVAc8u1Ng9yF8FJhw2zt1nfQvKo0UdDh7n8bcdzvgQ8idSynsV-Uvvspudg6FaIaZKlcyn6aLNfmIYKIh-d1kiyvb2Rxf_EUcTL-F6RkXvlE_sYwku0DQDgknR21SN2lN_BwCj123nZWKsw--wluJ9Lev-IufjxzFAGNULcP6WUFrYZl3mQ')",
                }}
              />
            </div>
          </div>

          <button className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        {/* MAIN */}
        <main className="py-6 sm:py-8 lg:py-12 px-4">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black">
              Encuentra la terraza perfecta para tu evento
            </h1>
            <p className="text-base text-text-light-secondary dark:text-text-dark-secondary">
              Explora, compara y reserva el lugar ideal para tu próxima
              celebración.
            </p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sticky top-[73px] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm py-4 mb-6">
            <div className="flex-grow">
              <div className="flex items-center rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 shadow-sm">
                <span className="material-symbols-outlined pl-5 text-text-light-secondary dark:text-text-dark-secondary">
                  search
                </span>
                <input
                  className="flex-1 bg-transparent px-4 text-base focus:outline-none"
                  placeholder="¿Dónde será tu evento?"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button className="flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 h-10 hover:border-primary/50 hover:bg-primary/10 transition">
                <span className="material-symbols-outlined">calendar_month</span>
                <p className="text-sm font-medium">Fecha</p>
              </button>
              <button className="flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 h-10 hover:border-primary/50 hover:bg-primary/10 transition">
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Invitados</p>
              </button>
              <button className="flex items-center gap-2 rounded-full bg-primary text-white px-4 h-10 hover:opacity-90 transition">
                <span className="material-symbols-outlined">tune</span>
                <p className="text-sm font-medium">Filtros</p>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
            {/* Ejemplo de tarjeta */}
            <div className="flex flex-col gap-3 group">
              <div className="relative overflow-hidden rounded-xl">
                <div
                  className="w-full aspect-[4/3] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDR4F505oIgIxlviG1zbviGawXPSJWnzkoe0567Ue2njmc1ys_f6iFOB4wFMiYkv5izp_DjvNb0ir_ZPHJKjC1Rm_msCIQ5IlvlD0AYxu-YcAjij-Sb5XbfgA28M_JPZZsuuU1bBIXmr8sddZbFjbpINaEuUyUWGXi0TbFd_NDx9NI0hHQ63Xu_fR67NzoxhuvEYXVcqzhhY8Phr2EwyZkd91tIyMiGfDPCeXvcRIYBLByQeq-kxd-Zz3vSwmQCAldqJ_70pcRhfk')",
                  }}
                />
                <button className="absolute top-3 right-3 text-white bg-black/30 rounded-full h-8 w-8 flex items-center justify-center hover:bg-primary/80 transition">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div>
                <p className="font-bold text-base">Terraza del Sol</p>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                  Colonia Roma Norte, CDMX
                </p>
                <p className="text-sm font-medium mt-1">
                  <span className="font-bold">$5,000</span> / evento
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
