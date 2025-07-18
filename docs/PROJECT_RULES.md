# VHQ_LAG_v2 PROJECT RULES

## 🎯 **STRICT ORGANIZATION & CLEANLINESS RULES**

### **📋 DIRECTORY STRUCTURE STANDARDS**

```
VHQ_LAG_v2/
├── README.md                    # Project overview
├── Cargo.toml                   # Rust workspace
├── src-tauri/                   # Tauri backend
├── src/                         # React frontend
├── agents/                      # Rust agents
├── n8n-workflows/              # n8n orchestration
├── docs/                        # Documentation
├── scripts/                     # Development scripts
├── tests/                       # Test files
├── config/                      # Configuration files
└── .github/                     # GitHub workflows
```

### **📝 FILE NAMING CONVENTIONS**

- **Rust files**: `snake_case.rs`
- **React components**: `PascalCase.tsx`
- **Configuration**: `kebab-case.json`
- **Documentation**: `UPPER_CASE.md`
- **Scripts**: `verb-noun.sh` or `verb-noun.ps1`

### **📚 DOCUMENTATION REQUIREMENTS**

- **Every directory**: Must have `README.md`
- **Every Rust module**: Must have doc comments
- **Every React component**: Must have JSDoc comments
- **Every configuration**: Must have inline comments
- **Every workflow**: Must have description

### **🔧 CODE ORGANIZATION RULES**

- **Single Responsibility**: Each file has one clear purpose
- **Maximum File Size**: 500 lines per file
- **Import Organization**: Alphabetical order, grouped by type
- **Error Handling**: Comprehensive error handling in all functions
- **Logging**: Structured logging with appropriate levels

### **📊 GIT COMMIT STANDARDS**

```
feat: add vitra_lag agent implementation
fix: resolve file upload issue in tauri ui
docs: update development strategy
refactor: optimize agent communication
test: add integration tests for ghost_lag
```

### **📈 PROGRESS TRACKING**

- **Daily**: Update progress in `docs/PROGRESS.md`
- **Weekly**: Update phase status in `docs/PHASE_STATUS.md`
- **Monthly**: Update master plan in `docs/MASTER_PLAN.md`

---

## 🔧 **DEVELOPMENT RULES**

### **1. BEFORE STARTING ANY WORK**
- [ ] Check current project status
- [ ] Review existing code for conflicts
- [ ] Update documentation if needed
- [ ] Create feature branch if major change
- [ ] Test existing functionality

### **2. DURING DEVELOPMENT**
- [ ] Follow Rust best practices
- [ ] Use TypeScript strict mode
- [ ] Write tests for new functionality
- [ ] Update documentation as you code
- [ ] Commit frequently with clear messages

### **3. BEFORE COMMITTING**
- [ ] Run all tests
- [ ] Check code formatting
- [ ] Update documentation
- [ ] Review for security issues
- [ ] Ensure no sensitive data in commits

### **4. QUALITY STANDARDS**
- **Code Coverage**: Minimum 80% for Rust, 70% for TypeScript
- **Performance**: All operations < 2 seconds
- **Memory Usage**: < 1GB total system
- **Error Rate**: < 1% for all operations
- **Documentation**: 100% coverage for public APIs

---

## 📊 **TRACKING & MONITORING RULES**

### **1. PROGRESS DOCUMENTATION**
```markdown
# docs/PROGRESS.md
## Week 1 (Jan 20-26)
- [x] Repository setup
- [x] Rust environment configuration
- [ ] VITRA_LAG agent implementation
- [ ] Basic Tauri UI setup

## Week 2 (Jan 27-Feb 2)
- [ ] GHOST_LAG agent implementation
- [ ] n8n workflow setup
- [ ] Agent communication testing
```

### **2. PHASE STATUS TRACKING**
```markdown
# docs/PHASE_STATUS.md
## Phase 1: Foundation (Weeks 1-4)
**Status**: 🔄 In Progress (Week 2)
**Completion**: 45%
**Next Milestone**: VITRA_LAG agent functional
**Blockers**: None
```

### **3. TECHNICAL DEBT TRACKING**
```markdown
# docs/TECHNICAL_DEBT.md
## High Priority
- [ ] Optimize memory usage in VITRA_LAG
- [ ] Add comprehensive error handling

## Medium Priority
- [ ] Refactor agent communication
- [ ] Improve test coverage
```

---

## 🚀 **DEPLOYMENT RULES**

### **1. ENVIRONMENT MANAGEMENT**
- **Development**: Local development with hot reload
- **Testing**: Automated testing environment
- **Staging**: Production-like testing environment
- **Production**: Live system deployment

### **2. VERSION CONTROL**
- **Main Branch**: Always deployable
- **Feature Branches**: For new features
- **Release Tags**: Semantic versioning
- **Hotfixes**: Emergency fixes only

### **3. SECURITY STANDARDS**
- **No Secrets in Code**: Use environment variables
- **Input Validation**: All user inputs validated
- **Error Messages**: No sensitive information in errors
- **Access Control**: Proper authentication and authorization

---

## 🎯 **SUCCESS METRICS**

### **TECHNICAL SUCCESS**
- ✅ All agents implemented in Rust
- ✅ n8n orchestrates workflows successfully
- ✅ Tauri app provides rich desktop experience
- ✅ System runs completely offline
- ✅ Cross-platform compatibility

### **BUSINESS SUCCESS**
- ✅ 90% reduction in manual intervention
- ✅ 10x faster content processing
- ✅ 99.9% system uptime
- ✅ Zero cloud dependencies
- ✅ Complete automation of workflows

### **USER SUCCESS**
- ✅ Intuitive user interface
- ✅ Real-time monitoring and control
- ✅ Remote access capabilities
- ✅ Comprehensive documentation
- ✅ Reliable performance

---

## 🛡️ **RISK MITIGATION**

### **TECHNICAL RISKS**
- **Rust Learning Curve**: Start with simple agents, reference Python code
- **n8n Integration**: Test workflows incrementally
- **Tauri Performance**: Benchmark against current system
- **Cross-platform Issues**: Test on multiple platforms early

### **BUSINESS RISKS**
- **Development Timeline**: Use phased approach, maintain current system
- **Feature Loss**: Gradual migration, comprehensive testing
- **User Experience**: Copy proven UI, improve performance

---

## 📋 **DAILY WORKFLOW**

### **MORNING ROUTINE**
1. **Check Project Status**: Review `docs/PROGRESS.md`
2. **Update Documentation**: Any changes from previous day
3. **Plan Today's Work**: Based on current phase
4. **Setup Environment**: Ensure all tools working

### **DEVELOPMENT SESSION**
1. **Create Feature Branch**: If working on new feature
2. **Write Tests First**: TDD approach
3. **Implement Feature**: Following coding standards
4. **Update Documentation**: As you code
5. **Test Thoroughly**: Before committing

### **END OF DAY**
1. **Commit Changes**: With clear messages
2. **Update Progress**: In `docs/PROGRESS.md`
3. **Review Tomorrow**: Plan next steps
4. **Backup Work**: If needed

---

## 🚨 **EMERGENCY PROCEDURES**

### **CRITICAL ISSUES**
1. **System Down**: Immediate rollback to last working version
2. **Data Loss**: Restore from backup
3. **Security Breach**: Isolate and investigate
4. **Performance Issues**: Optimize or scale

### **COMMUNICATION**
- **Daily Updates**: Progress in `docs/PROGRESS.md`
- **Weekly Reviews**: Phase status updates
- **Monthly Planning**: Master plan updates
- **Emergency Contacts**: Available in `docs/EMERGENCY.md`

---

## 📚 **REFERENCE MATERIALS**

### **CURRENT SYSTEM ACCESS**
- **Repository**: `../VHQ_LAG/` (reference only)
- **UI Components**: `../VHQ_LAG/frontend/src/components/`
- **Agent Logic**: `../VHQ_LAG/16_VITRA_LAG/`, `../VHQ_LAG/15_GHOST_LAG/`
- **Configurations**: Copy and adapt as needed

### **DEVELOPMENT RESOURCES**
- **Rust Book**: https://doc.rust-lang.org/book/
- **Tauri Docs**: https://tauri.app/docs/
- **n8n Docs**: https://docs.n8n.io/
- **React Docs**: https://react.dev/

---

## 🎯 **MISSION STATEMENT**

**Build the most efficient, reliable, and user-friendly multi-agent AI system for business automation while maintaining strict organization, comprehensive documentation, and high code quality standards.**

---

**📅 Last Updated**: January 2025  
**📋 Version**: 1.0  
**👥 Maintainer**: AI Development Assistant  
**🎯 Status**: Active Development 