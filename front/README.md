# Front

1. Login - auth-user
   POST https://openfaas.flusin.fr/function/auth-user
   Body
   {
   "username": "testuser",
   "password": "lRcZWEKJl^Mi5e)&nfXk#Xl3",
   "totp": "752912"
   }
   Response
   200 OK on est connecté
   400 il manque un paramètre
   401 identifiants invalide
   500 Code 2FA invalide
   403 mot de passe expiré, il faut générer un nouveau mot de passe

2. Generate 2FA
   https://openfaas.flusin.fr/function/generate-2fa
   Body
   {
   "username": "testuser"
   }
   Response
   200 {"secret":"M4MFOULDNZJQSR2A","otpauth":"otpauth://totp/COFRAP-SYSTEM%3Atestuser?secret=M4MFOULDNZJQSR2A&issuer=COFRAP-SYSTEM","qr":"data:image/png;base64,Jggg=="}
   400 Utilisateur n'existe pas
   500 Erreur serveur

3. Create account and generate password for reset password
   https://openfaas.flusin.fr/function/generate-password
   Body
   {
   "username": "testuser"
   }
   Response
   200 {"password":"LC\*wsBig%eK6RTq^i7LXGlE$","qr":"data:image/png;base64,iVBOARK5CYII="}
   400 il manque un paramètre
