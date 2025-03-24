export type TJwtOtpPayload = {
	userId: number;
};

export type TJwtRefreshTokenPayload = {
	phone: string;
};

export type TJwtPhonePayload = {
	phone: string;
};
