export function permitirPerfis(perfisPermitidos) {
	return (req, res, next) => {
		const perfil = req.usuario && req.usuario.perfil;
		if (perfisPermitidos.includes(perfil)) {
			return next();
		}

		return res.status(403).json({ erro: "Acesso negado" });
	};
}


export const autorization = {
	admin: permitirPerfis(["admin"]),
	user: permitirPerfis(["user"])
};

export default autorization;