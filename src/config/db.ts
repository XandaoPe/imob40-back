import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI não está definida nas variáveis de ambiente.');
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Conectado com sucesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error}`);
        process.exit(1);
    }
};