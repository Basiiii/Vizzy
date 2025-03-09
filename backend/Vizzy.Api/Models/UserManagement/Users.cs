using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace Vizzy.Api.Models.UserManagement {
  /// <summary>
  /// Represents a user in the system.
  /// </summary>
  [Table("users")]
  public class User : BaseModel {
    [PrimaryKey("id")]
    public new string Id { get;
    set;
  }

  [Column("username")]
  public string UserName { get; set; }

  [Column("email")]
  public string Email {
    get; set;
  }

  [Column("name")]
  public string Name {
    get; set;
  }

  [Column("location_id")]
  public int? LocationId {
    get; set;
  }

  [Column("is_deleted")]
  public bool IsDeleted {
    get; set;
  }

  [Column("deleted_at")]
  public DateTime? DeletedAt {
    get; set;
  }
}
}
