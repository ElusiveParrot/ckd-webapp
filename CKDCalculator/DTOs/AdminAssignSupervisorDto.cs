namespace CKDCalculator.DTOs;

public class AdminAssignSupervisorDto
{
    public MasterData  Master { get; set; }
    public SlaveData   Slave  { get; set; }
    
    public class MasterData
    {
        public long ProfessionalId { get; set; }
    }

    public class SlaveData
    {
        public long? ProfessionalId { get; set; }
        public long? NhsNumber      { get; set; }
    }
}