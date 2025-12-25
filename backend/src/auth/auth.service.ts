import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

import { DoctorProfileService } from '../doctor-profile/doctor-profile.service';
import { Patient, PatientDocument } from '../schemas/patient.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private jwtService: JwtService,
    private doctorProfileService: DoctorProfileService,
  ) { }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
    });

    await user.save();

    // Create initial doctor profile
    await this.doctorProfileService.createOrUpdate(user._id.toString(), {
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization || '',
      degrees: [],
      degreesBangla: [],
      socialLinks: {},
    });

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: user.specialization,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        specialization: user.specialization,
        prescriptionHeader: user.prescriptionHeader,
        prescriptionFooter: user.prescriptionFooter,
        signature: user.signature,
        language: user.language,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    return user;
  }
  
  async patientRegister(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const patient = new this.patientModel({
      ...data,
      password: hashedPassword,
    });
    await patient.save();

    const payload = { phone: patient.phone, sub: patient._id, role: 'patient' };
    const { password: _, ...patientData } = patient.toObject();

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...patientData,
        id: patient._id,
      },
    };
  }

  async patientLogin(phone: string, password: string) {
    const patient = await this.patientModel.findOne({ phone });
    if (!patient) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, patient.password);
    if (!isValid) throw new Error('Invalid credentials');

    const payload = { phone: patient.phone, sub: patient._id, role: 'patient' };
    const { password: __, ...patientData } = patient.toObject();

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...patientData,
        id: patient._id,
      },
    };
  }
}
