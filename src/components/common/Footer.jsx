import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-white text-2xl font-bold mb-4">
              Freelance<span className="text-primary">Hub</span>
            </h2>
            <p className="text-sm leading-relaxed">
              The world's largest marketplace for digital freelance services.
            </p>
          </div>
          {[
            {
              title: "Categories",
              links: ["Graphics & Design", "Digital Marketing", "Writing", "Video & Animation", "Programming"],
            },
            {
              title: "About",
              links: ["Careers", "Press & News", "Partnerships", "Privacy Policy", "Terms of Service"],
            },
            {
              title: "Support",
              links: ["Help & Support", "Trust & Safety", "Selling on FreelanceHub", "Buying on FreelanceHub"],
            },
            {
              title: "Community",
              links: ["Events", "Blog", "Forum", "Podcast", "Affiliates"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-white font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to="/gigs" className="text-sm hover:text-primary transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-gray-600 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} FreelanceHub. All rights reserved.</p>
          <div className="flex gap-4">
            {["Twitter", "Facebook", "LinkedIn", "Instagram"].map((social) => (
              <a key={social} href="#" className="text-sm hover:text-primary transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
