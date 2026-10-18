export default function Footer() {
    return (
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/images/logo.png"
                  alt="Raphadent"
                  className="w-8 h-8 object-contain rounded bg-white"
                />
                <h3 className="text-lg font-bold text-white">Raphadent</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Restoring Oral Health & Smiles. Your Trusted Dental Care Partner.
              </p>
            </div>
  
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                </li>
                <li>
                  <a href="/patients" className="hover:text-white transition-colors">Patients</a>
                </li>
                <li>
                  <a href="/appointments" className="hover:text-white transition-colors">Appointments</a>
                </li>
                <li>
                  <a href="/billing" className="hover:text-white transition-colors">Billing</a>
                </li>
              </ul>
            </div>
  
            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Ebonyi State, Nigeria</li>
                <li>+234 905 093 8991</li>
                <li>info@raphadent.com</li>
              </ul>
            </div>
          </div>
  
          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Raphadent Dental Clinic. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
            Restoring Oral Health & Smiles.
            </p>
          </div>
        </div>
      </footer>
    );
  }