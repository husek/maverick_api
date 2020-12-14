import './LoadEnv';
import app from '@server';
import mongoose from 'mongoose';
import { registerRequestLogger } from '@shared/Logger';

// Start Logger
registerRequestLogger(app);

mongoose.connect(`${process.env.MONGODB_URL}`, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
}, err => {
  if (!err) console.log('MongoDB Connected');
});

// Start Server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.info(`Server started on port: ${port}`);
});