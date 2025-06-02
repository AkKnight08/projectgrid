const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [1, 'Project name cannot be empty']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Member user ID is required']
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'member', 'viewer'],
        message: 'Role must be one of: admin, member, viewer'
      },
      default: 'member'
    }
  }],
  pendingMembers: [{
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'archived'],
      message: 'Status must be one of: active, completed, archived'
    },
    default: 'active'
  },
  startDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v instanceof Date;
      },
      message: 'Start date must be a valid date'
    }
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v instanceof Date;
      },
      message: 'End date must be a valid date'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  settings: {
    visibility: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: 'Visibility must be either public or private'
      },
      default: 'private'
    },
    allowComments: {
      type: Boolean,
      default: true
    }
  },
  layout: {
    lg: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 3 },
      h: { type: Number, default: 2 }
    },
    md: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 3 },
      h: { type: Number, default: 2 }
    },
    sm: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 3 },
      h: { type: Number, default: 2 }
    },
    xs: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 3 },
      h: { type: Number, default: 2 }
    },
    xxs: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 3 },
      h: { type: Number, default: 2 }
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure at least one member (owner) exists
projectSchema.pre('save', function(next) {
  if (!this.members || this.members.length === 0) {
    this.members = [{ user: this.owner, role: 'admin' }];
  }
  next();
});

// Index for better search performance
projectSchema.index({ name: 'text', description: 'text' });

// Add indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ 'pendingMembers.email': 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project; 